import { NextRequest, NextResponse } from 'next/server';
import { SEED_DISHES } from '@/data/seed/dishes';

export async function POST(req: NextRequest) {
  try {
    const { action, text, budget, diners, days } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (action === 'parse_recipe') {
      if (apiKey) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content:
                    'Eres un chef y nutricionista peruano experto. Analiza el texto libre de la receta y responde EXCLUSIVAMENTE con un JSON con el siguiente formato: { name: string, category: string, moments: string[], prepTimeMinutes: number, priceRefPerPlate: number, description: string, ingredients: [{ ingredientName: string, category: string, amountForOne: number, unit: string }] }. Calcula las cantidades de ingredientes EXACTAMENTE para 1 plato/porción.',
                },
                { role: 'user', content: text },
              ],
              response_format: { type: 'json_object' },
            }),
          });

          if (response.ok) {
            const json = await response.json();
            const content = json.choices?.[0]?.message?.content;
            const parsed = JSON.parse(content);
            return NextResponse.json({ success: true, parsed, engine: 'openrouter' });
          }
        } catch (e) {
          console.warn('OpenRouter parsing failed, falling back to local rule engine', e);
        }
      }

      // Motor Heurístico Local sin API Key
      const lines = (text || '').split('\n').filter((l: string) => l.trim().length > 0);
      const title = lines[0]?.replace(/^#+\s*/, '').trim() || 'Nuevo Plato Casero';

      const ingredientsParsed: Array<{
        ingredientName: string;
        category: string;
        amountForOne: number;
        unit: string;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Heurística simple: buscar números y unidades (g, kg, ml, und, dientes, etc.)
        const match = line.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|und|unidades|dientes|atado|lata)?\s*(?:de\s+)?(.+)/i);
        if (match) {
          const rawAmount = parseFloat(match[1]);
          let unit = (match[2] || 'und').toLowerCase();
          if (unit === 'kg') unit = 'g';
          if (unit === 'l') unit = 'ml';
          const name = match[3]?.trim() || line.trim();

          ingredientsParsed.push({
            ingredientName: name,
            category: 'Víveres',
            amountForOne: rawAmount,
            unit: unit === 'unidades' ? 'und' : unit,
          });
        } else if (line.trim().length > 3) {
          ingredientsParsed.push({
            ingredientName: line.trim(),
            category: 'Víveres',
            amountForOne: 1,
            unit: 'und',
          });
        }
      }

      return NextResponse.json({
        success: true,
        engine: 'local-heuristic',
        parsed: {
          name: title,
          category: 'Criollo',
          moments: ['almuerzo', 'cena'],
          prepTimeMinutes: 30,
          priceRefPerPlate: 7.0,
          description: text.slice(0, 120),
          ingredients: ingredientsParsed.length > 0 ? ingredientsParsed : [
            { ingredientName: 'Ingrediente principal', category: 'Víveres', amountForOne: 100, unit: 'g' }
          ],
        },
      });
    }

    if (action === 'suggest_menu') {
      const targetBudget = budget || 150; // S/ en Soles
      const targetDiners = diners || 4;
      const targetDays = days || 7;

      // Sugerencia inteligente de menú basado en platos criollos de serie
      const sortedDishes = [...SEED_DISHES].sort((a, b) => a.priceRefPerPlate - b.priceRefPerPlate);
      const selected = sortedDishes.slice(0, targetDays);

      return NextResponse.json({
        success: true,
        engine: apiKey ? 'openrouter' : 'local-rule',
        suggestedDishes: selected,
        estimatedWeeklyCost: selected.reduce((sum, d) => sum + d.priceRefPerPlate * targetDiners, 0),
        budget: targetBudget,
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('Error en /api/ai:', error);
    return NextResponse.json({ success: false, error: 'Error procesando solicitud de IA' }, { status: 500 });
  }
}
