// js/services/auth.js

// chave pra salvar no navegador (como se fosse o nome da tabela)
const CHAVE_USUARIO = 'aulalivre_usuario';

export const authService = {
    
    // tenta fazer login (simulado)
    logar: (email, senha) => {
        // MOCK: por enquanto, só aceita esse usuario fixo
        // no futuro isso aqui vira um fetch pro django
        if (email === 'aluno@email.com' && senha === '123456') {
            const usuario = {
                nome: 'Clebs Alexandre',
                email: email,
                tipo: 'aluno',
                token: 'token_falso_123'
            };
            
            // salva no navegador (transforma objeto em texto)
            localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
            return { sucesso: true };
        }
        
        return { sucesso: false, erro: 'E-mail ou senha incorretos' };
    },

    // funcao nova: registrar usuario (simulado)
    registrar: (nome, email, senha, tipo) => {
        // MOCK: cria o objeto do usuario novo na mao
        // aqui a gente mandaria um POST pro django criar no banco de vdd
        const novoUsuario = {
            nome: nome,
            email: email,
            tipo: tipo, // 'aluno' ou 'professor'
            token: 'token_novo_456'
        };

        // ja salva e loga direto pra facilitar a vida do usuario
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(novoUsuario));
        return { sucesso: true };
    },

    // apaga o usuario do navegador
    deslogar: () => {
        localStorage.removeItem(CHAVE_USUARIO);
    },

    // verifica se tem alguem logado
    usuarioEstaLogado: () => {
        const usuario = localStorage.getItem(CHAVE_USUARIO);
        return !!usuario; // retorna true se tiver texto, false se for null
    },

    // pega os dados do usuario pra mostrar na tela
    getUsuario: () => {
        const usuario = localStorage.getItem(CHAVE_USUARIO);
        return usuario ? JSON.parse(usuario) : null;
    }
};