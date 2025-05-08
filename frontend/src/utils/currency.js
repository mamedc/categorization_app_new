// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\utils\currency.js
// Create this new file if it doesn't exist

/**
 * Formats a number or string representing a number into Brazilian Real (BRL) currency format.
 * Handles potential null/undefined/NaN values gracefully.
 *
 * @param {number|string|null|undefined} value The value to format.
 * @param {string} [placeholder="R$ 0,00"] The string to return if the value is invalid.
 * @returns {string} The formatted currency string or the placeholder.
 */
export function formatBrazilianCurrency(value, placeholder = "R$ 0,00") {
    let number = value;

    // Convert string to number if necessary
    if (typeof value === 'string') {
        // Remove non-numeric characters except comma and dot for parsing
        const cleanedValue = value.replace(/[^0-9.,-]/g, '');
        // Standardize decimal separator to dot
        const standardizedValue = cleanedValue.replace(',', '.');
        number = parseFloat(standardizedValue);
    } else if (typeof value !== 'number') {
        number = NaN; // Ensure non-numeric types (except string) result in NaN
    }

    if (isNaN(number) || number === null) {
        return placeholder; // Return placeholder for invalid inputs
    }

    // Format the valid number
    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);

    return formattedValue;
}

// Example usage:
// formatBrazilianCurrency(1234.56)   // "R$ 1.234,56"
// formatBrazilianCurrency("1234.56") // "R$ 1.234,56"
// formatBrazilianCurrency("1.234,56") // "R$ 1.234,56" (Handles pt-BR format input)
// formatBrazilianCurrency("-500")     // "-R$ 500,00"
// formatBrazilianCurrency(null)      // "R$ 0,00"
// formatBrazilianCurrency(undefined) // "R$ 0,00"
// formatBrazilianCurrency("invalid") // "R$ 0,00"