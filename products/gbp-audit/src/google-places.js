/**
 * Google Places API (New) client
 * Fetches business data for audit analysis.
 *
 * API Reference: https://developers.google.com/maps/documentation/places/web-service/op-overview
 */

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

/**
 * Search for a business by name and location.
 * @param {string} query - Business name or search term
 * @param {string} apiKey - Google Places API key
 * @param {object} options - Optional: locationBias, maxResults
 * @returns {Promise<object[]>} Array of place results
 */
export async function searchPlaces(query, apiKey, options = {}) {
  const { locationBias, maxResults = 5 } = options;

  const body = {
    textQuery: query,
    maxResultCount: maxResults,
    languageCode: 'en',
  };

  if (locationBias) {
    body.locationBias = locationBias;
  }

  const response = await fetch(`${PLACES_API_BASE}:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.rating',
        'places.userRatingCount',
        'places.types',
        'places.primaryType',
        'places.primaryTypeDisplayName',
      ].join(','),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new PlacesApiError(
      `Places search failed: ${response.status} ${response.statusText}`,
      response.status,
      error
    );
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Get full details for a specific place by ID.
 * @param {string} placeId - Google Place ID
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<object>} Full place details
 */
export async function getPlaceDetails(placeId, apiKey) {
  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'nationalPhoneNumber',
    'internationalPhoneNumber',
    'websiteUri',
    'regularOpeningHours',
    'editorialSummary',
    'rating',
    'userRatingCount',
    'reviews',
    'photos',
    'types',
    'primaryType',
    'primaryTypeDisplayName',
    'accessibilityOptions',
    'paymentOptions',
    'dineIn',
    'delivery',
    'takeout',
    'reservable',
    'googleMapsUri',
    'businessStatus',
    'priceLevel',
    'location',
  ].join(',');

  const response = await fetch(`${PLACES_API_BASE}/${placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new PlacesApiError(
      `Place details failed: ${response.status} ${response.statusText}`,
      response.status,
      error
    );
  }

  return response.json();
}

/**
 * Search for competitors near a business location.
 * @param {string} businessType - Primary business type/category
 * @param {object} location - { lat, lng } of the business
 * @param {string} apiKey - Google Places API key
 * @param {number} radiusMeters - Search radius (default 5000m = ~3mi)
 * @returns {Promise<object[]>} Array of competitor places
 */
export async function findCompetitors(businessType, location, apiKey, radiusMeters = 5000) {
  const body = {
    textQuery: businessType,
    maxResultCount: 10,
    languageCode: 'en',
    locationBias: {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng,
        },
        radius: radiusMeters,
      },
    },
  };

  const response = await fetch(`${PLACES_API_BASE}:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.rating',
        'places.userRatingCount',
        'places.photos',
        'places.primaryTypeDisplayName',
        'places.websiteUri',
      ].join(','),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new PlacesApiError(
      `Competitor search failed: ${response.status} ${response.statusText}`,
      response.status,
      error
    );
  }

  const data = await response.json();
  return data.places || [];
}

class PlacesApiError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'PlacesApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export { PlacesApiError };
