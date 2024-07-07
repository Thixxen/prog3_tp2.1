class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    async loadCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);
            const data = await response.json();
            this.currencies = Object.keys(data).map(code => new Currency(code, data[code]));
        } catch (error) {
            console.error('Error loading currencies:', error);
        }
    }

    async getConversionRate(amount, fromCode, toCode) {
        if (fromCode === toCode) return parseFloat(amount);
        try {
            const response = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCode}&to=${toCode}`);
            const data = await response.json();
            return data.rates?.[toCode] ?? null;
        } catch (error) {
            console.error('Error getting conversion rate:', error);
            return null;
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const amount = document.getElementById("amount").value;
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");
    await converter.loadCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    const fromCurrency = converter.currencies.find(currency => currency.code === fromCurrencySelect.value);
    const toCurrency = converter.currencies.find(currency => currency.code === toCurrencySelect.value);

    const convertedAmount = await converter.getConversionRate(amount, fromCurrency.code, toCurrency.code);

    updateResultDisplay(amount, fromCurrency, toCurrency, convertedAmount);
}

function populateCurrencies(selectElement, currencies) {
    if (!selectElement || !currencies.length) return;
    currencies.forEach(currency => {
        const option = document.createElement("option");
        option.value = currency.code;
        option.textContent = `${currency.code} - ${currency.name}`;
        selectElement.appendChild(option);
    });
}

function updateResultDisplay(amount, fromCurrency, toCurrency, convertedAmount) {
    if (convertedAmount !== null && !isNaN(convertedAmount)) {
        document.getElementById("result").textContent = `${amount} ${fromCurrency.code} son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
    } else {
        document.getElementById("result").textContent = "Error al realizar la conversión.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("conversion-form");
    form.addEventListener("submit", handleFormSubmit);
});
