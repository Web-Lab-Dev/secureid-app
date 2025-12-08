import { NextRequest, NextResponse } from 'next/server';

/**
 * API ROUTE - REVERSE GEOCODING
 *
 * Convertit des coordonnées GPS (lat, lng) en adresse lisible (ville, pays)
 * Utilise l'API OpenStreetMap Nominatim (gratuit, sans clé API)
 */

interface GeocodeResult {
  city?: string;
  country?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    // Validation des paramètres
    if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Appel à l'API Nominatim (OpenStreetMap)
    // Format: https://nominatim.openstreetmap.org/reverse?lat=48.8566&lon=2.3522&format=json
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SecureID-App/1.0', // Requis par Nominatim
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding API error');
    }

    const data = await response.json();

    // Extraction de la ville et du pays depuis la réponse
    const address = data.address || {};

    // Ville : chercher dans city, town, village, ou hamlet
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.municipality ||
      'Unknown City';

    // Pays
    const country = address.country || 'Unknown Country';

    const result: GeocodeResult = {
      city,
      country,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode coordinates' },
      { status: 500 }
    );
  }
}
