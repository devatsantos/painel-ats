/**
 * Consulta o ViaCEP e retorna os dados do endereço.
 * Usa a URL configurada no backend via Inertia shared data.
 *
 * @param {string} cep — CEP (com ou sem máscara)
 * @param {string} baseUrl — URL base do ViaCEP (default: https://viacep.com.br/ws)
 * @returns {Promise<object|null>} Dados do endereço ou null se inválido
 */
export async function consultarCep(cep, baseUrl = 'https://viacep.com.br/ws') {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/${cepLimpo}/json/`);
        const data = await response.json();

        if (data.erro) {
            return null;
        }

        return {
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
        };
    } catch {
        return null;
    }
}
