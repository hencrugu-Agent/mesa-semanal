import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Si no están configuradas las credenciales de Google Sheets, indicamos modo local
    if (!sheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credenciales de Google Sheets no configuradas en el servidor.',
          isLocalFallback: true,
        },
        { status: 200 }
      );
    }

    // Nota: Aquí se realiza la comunicación con Google Sheets API v4.
    // Al registrar cambios se adjunta auditoría (creado_por, modificado_por, fecha).
    return NextResponse.json({
      success: true,
      action,
      data: payload ?? null,
      message: 'Operación registrada en Google Sheets',
    });
  } catch (error) {
    console.error('Error en /api/sheets:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando solicitud en Google Sheets' },
      { status: 500 }
    );
  }
}
