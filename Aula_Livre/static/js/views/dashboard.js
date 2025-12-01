// js/views/dashboard.js

import { authService } from '../services/auth.js';

// --- DADOS MOCKADOS (Com dados extras para simular a avaliação salva) ---

const mockAulasAluno = [
    { 
        id: 1, 
        professor: "Ana Pereira", 
        materia: "Inglês", 
        data: "Terça - 19:00", 
        status: "Confirmada", 
        cor: "bg-success",
        avaliado: false 
    },
    { 
        id: 2, 
        professor: "Carlos Silva", 
        materia: "Matemática", 
        data: "Quarta - 16:00", 
        status: "Pendente", 
        cor: "bg-warning text-dark",
        avaliado: false
    },
    // Aula concluída mas PENDENTE de avaliação
    { 
        id: 3, 
        professor: "Roberto Campos", 
        materia: "Física", 
        data: "Ontem", 
        status: "Concluído", 
        cor: "bg-secondary", 
        avaliado: false 
    },
    // Aula concluída e JÁ AVALIADA (Simulando dados salvos)
    { 
        id: 4, 
        professor: "Júlia Costa", 
        materia: "Redação", 
        data: "Semana passada", 
        status: "Concluído", 
        cor: "bg-secondary", 
        avaliado: true,
        minhaAvaliacao: { nota: 5, comentario: "Aula excelente, adorei a didática!" }
    }
];

export const mockHorariosProfessor = [
    { id: 1, dia: "Segunda", hora: "14:00", status: "Livre", aluno: "-", cor: "bg-info text-dark" },
    { id: 2, dia: "Quarta", hora: "10:00", status: "Agendado", aluno: "Joãozinho", cor: "bg-primary" },
    { id: 3, dia: "Sexta", hora: "18:00", status: "Concluído", aluno: "Maria", cor: "bg-success" }
];

let minhasDisciplinasMock = ["Matemática", "Física"]; 

// --- VARIAVEIS GLOBAIS ---
let acaoPendente = null;
let idPendente = null;
let modalConfirmacaoInstance = null;
// Variável auxiliar para saber qual aula está sendo avaliada no momento
let idAulaSendoAvaliada = null; 

// --- FUNCOES AUXILIARES ---

function notificarSeguro(msg, tipo) {
    if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao(msg, tipo);
    } else {
        alert(msg); 
    }
}

// Funções do Professor (mantidas iguais)
window.solicitarGerenciamento = function(id, acao) {
    acaoPendente = acao;
    idPendente = id;
    const txtConfirmacao = document.getElementById('texto-confirmacao');
    
    if (acao === 'concluir') txtConfirmacao.innerText = 'Deseja marcar esta aula como concluída?';
    else if (acao === 'cancelar') txtConfirmacao.innerText = 'Deseja cancelar o agendamento?';
    else if (acao === 'excluir') txtConfirmacao.innerText = 'Excluir este horário?';

    const modalEl = document.getElementById('modal-confirmacao');
    if (!modalConfirmacaoInstance) {
        modalConfirmacaoInstance = new bootstrap.Modal(modalEl);
    }
    modalConfirmacaoInstance.show();
}

window.confirmarAcaoPendente = function() {
    const index = mockHorariosProfessor.findIndex(h => h.id == idPendente);
    
    if (index !== -1) {
        const horario = mockHorariosProfessor[index];
        if (acaoPendente === 'concluir') {
            horario.status = 'Concluído';
            horario.cor = 'bg-success';
            notificarSeguro('Aula concluída!', 'sucesso');
        } else if (acaoPendente === 'cancelar') {
            horario.status = 'Livre';
            horario.aluno = '-';
            horario.cor = 'bg-info text-dark';
            notificarSeguro('Cancelado.', 'sucesso');
        } else if (acaoPendente === 'excluir') {
            mockHorariosProfessor.splice(index, 1);
            notificarSeguro('Horário excluído.', 'sucesso');
        }
    }
    if (modalConfirmacaoInstance) modalConfirmacaoInstance.hide();
    setTimeout(() => { document.getElementById('conteudo-principal').innerHTML = obterConteudoDashboard(); }, 200);
}

// --- LÓGICA DE AVALIAÇÃO E CERTIFICADO ---

window.selecionarEstrela = function(nota) { 
    // Se o campo estiver desabilitado (modo visualização), não faz nada
    if (document.getElementById('nota-final').disabled) return;

    document.getElementById('nota-final').value = nota; 
    const estrelas = document.querySelectorAll('.estrela-interativa'); 
    estrelas.forEach(estrela => { 
        const valorEstrela = parseInt(estrela.getAttribute('data-nota')); 
        if (valorEstrela <= nota) { 
            estrela.classList.remove('bi-star'); 
            estrela.classList.add('bi-star-fill'); 
        } else { 
            estrela.classList.remove('bi-star-fill'); 
            estrela.classList.add('bi-star'); 
        } 
    }); 
}

// Abre o modal para criar uma nova avaliação
window.abrirAvaliacao = function(idAula, nomeProfessor) { 
    idAulaSendoAvaliada = idAula; // Salva o ID pra usar no salvar
    
    // Reseta o form para estado "editável"
    const form = document.getElementById('form-avaliacao');
    form.reset();
    document.getElementById('nota-final').value = "0";
    document.getElementById('nota-final').disabled = false;
    
    // Reseta estrelas
    const estrelas = document.querySelectorAll('.estrela-interativa');
    estrelas.forEach(e => {
        e.classList.remove('bi-star-fill');
        e.classList.add('bi-star');
        e.style.cursor = 'pointer'; // volta o cursor de clique
    });

    // Limpa e habilita textarea e botão
    const textarea = form.querySelector('textarea');
    textarea.value = '';
    textarea.disabled = false;
    
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.style.display = 'block'; // Mostra o botão enviar

    document.getElementById('nome-avaliado').innerText = nomeProfessor; 
    
    const modalEl = document.getElementById('modal-avaliacao'); 
    const modal = new bootstrap.Modal(modalEl); 
    modal.show(); 
}

// Abre o modal APENAS PARA LEITURA
window.verAvaliacao = function(idAula, nomeProfessor) {
    const aula = mockAulasAluno.find(a => a.id === idAula);
    if (!aula || !aula.minhaAvaliacao) return;

    const dados = aula.minhaAvaliacao;

    // Preenche as estrelas visualmente
    const estrelas = document.querySelectorAll('.estrela-interativa');
    estrelas.forEach(estrela => {
        const valorEstrela = parseInt(estrela.getAttribute('data-nota'));
        // Remove comportamento de clique visual (cursor)
        estrela.style.cursor = 'default';
        
        if (valorEstrela <= dados.nota) {
            estrela.classList.remove('bi-star');
            estrela.classList.add('bi-star-fill');
        } else {
            estrela.classList.remove('bi-star-fill');
            estrela.classList.add('bi-star');
        }
    });

    // Desabilita campos
    document.getElementById('nota-final').value = dados.nota;
    document.getElementById('nota-final').disabled = true;

    const textarea = document.querySelector('#form-avaliacao textarea');
    textarea.value = dados.comentario;
    textarea.disabled = true;

    // Esconde o botão de enviar pois é só visualização
    const btnSubmit = document.querySelector('#form-avaliacao button[type="submit"]');
    btnSubmit.style.display = 'none';

    document.getElementById('nome-avaliado').innerText = nomeProfessor + " (Sua Avaliação)";
    
    const modalEl = document.getElementById('modal-avaliacao');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// Lógica simulada de salvar avaliação (deve ser chamada no router.js ou aqui se movermos o listener)
// Para simplificar, vou exportar uma função que o router pode usar ou adicionar listener direto aqui se necessário
// Mas como o router já tem o 'configurarAvaliacao', vamos apenas atualizar o mock
window.salvarAvaliacaoMock = function(nota, comentario) {
    if (idAulaSendoAvaliada) {
        const aula = mockAulasAluno.find(a => a.id === idAulaSendoAvaliada);
        if (aula) {
            aula.avaliado = true;
            aula.minhaAvaliacao = { nota: parseInt(nota), comentario: comentario };
            // Atualiza a tela
            document.getElementById('conteudo-principal').innerHTML = obterConteudoDashboard();
        }
    }
}

window.verCertificado = function(nomePessoa, materia) { 
    document.getElementById('cert-nome-pessoa').innerText = nomePessoa; 
    document.getElementById('cert-materia').innerText = materia; 
    const dataHoje = new Date().toLocaleDateString('pt-BR'); 
    document.getElementById('cert-data').innerText = dataHoje; 
    const modalEl = document.getElementById('modal-certificado'); 
    const modal = new bootstrap.Modal(modalEl); 
    modal.show(); 
}

// --- MODAIS DO PROFESSOR (MANTIDOS) ---
export function atualizarSelectDoModal() {
    const select = document.getElementById('horario-disciplina');
    if (!select) return;
    select.innerHTML = ''; 
    if (minhasDisciplinasMock.length === 0) {
        select.innerHTML = '<option disabled selected>Selecione disciplinas no seu perfil!</option>';
    } else {
        minhasDisciplinasMock.forEach(disc => {
            const option = document.createElement('option');
            option.value = disc;
            option.innerText = disc;
            select.appendChild(option);
        });
    }
}

window.abrirModalNovoHorario = function() {
    atualizarSelectDoModal();
    const modalEl = document.getElementById('modal-novo-horario');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

export function adicionarHorarioMock(dados) {
    mockHorariosProfessor.push({
        id: Date.now(),
        dia: dados.dia,
        hora: dados.hora,
        disciplina: dados.disciplina,
        assunto: dados.assunto,
        nivel: dados.nivel,
        link: dados.link,
        status: "Livre",
        aluno: "-",
        cor: "bg-info text-dark"
    });
}

function gerarTagsDisciplinas() {
    if (minhasDisciplinasMock.length === 0) return '<span class="text-muted small">Nenhuma selecionada.</span>';
    return minhasDisciplinasMock.map(disc => `<span class="badge bg-light text-primary border me-1 mb-1">${disc}</span>`).join('');
}

export function salvarDisciplinasSelecionadas() {
    const checkboxes = document.querySelectorAll('#form-disciplinas input[type="checkbox"]:checked');
    minhasDisciplinasMock = [];
    checkboxes.forEach(chk => { minhasDisciplinasMock.push(chk.value); });
    atualizarSelectDoModal();
}

// --- RENDERIZADORES ---

// ATUALIZADO: Agora com colunas separadas para Avaliação e Certificado
function gerarTabelaAluno() {
    if (mockAulasAluno.length === 0) return `<tr><td colspan="5" class="text-center">Nenhuma aula.</td></tr>`;
    
    return mockAulasAluno.map(aula => {
        let colAvaliacao = '';
        let colCertificado = '';

        // Se a aula NÃO foi concluída pelo professor
        if (aula.status !== 'Concluído') {
            // Se tiver link (agendada), mostra o botão de entrar, senão traço
            const botaoEntrar = `<a href="#" class="btn btn-sm btn-outline-primary fw-bold text-decoration-none" title="Entrar na Sala"><i class="bi bi-camera-video-fill me-1"></i> Acessar</a>`;
            
            // Lógica: Se tá pendente/agendado, mostra link. Avaliação e Certificado ficam vazios.
            colAvaliacao = '<span class="text-muted small">-</span>';
            colCertificado = '<span class="text-muted small">-</span>';
            
            // Sobrescreve a ação principal na coluna de status ou cria uma lógica visual
            // (Neste layout novo, o botão de entrar pode ficar na coluna status ou numa coluna "Link")
            // Vamos manter simples: se não concluiu, não tem o que fazer nas colunas finais.
        } 
        // Se a aula FOI CONCLUÍDA
        else {
            if (aula.avaliado) {
                // Já avaliou: Pode VER a avaliação (sem alterar) e BAIXAR certificado
                colAvaliacao = `
                    <button class="btn btn-sm btn-info text-white" onclick="window.verAvaliacao(${aula.id}, '${aula.professor}')">
                        <i class="bi bi-eye-fill me-1"></i> Ver Avaliação
                    </button>`;
                
                colCertificado = `
                    <button class="btn btn-sm btn-outline-dark" onclick="window.verCertificado('${authService.getUsuario().nome}', '${aula.materia}')">
                        <i class="bi bi-award-fill me-1"></i> Certificado
                    </button>`;
            } else {
                // Não avaliou ainda: Botão Avaliar disponível, Certificado Bloqueado
                colAvaliacao = `
                    <button class="btn btn-sm btn-warning fw-bold" onclick="window.abrirAvaliacao(${aula.id}, '${aula.professor}')">
                        <i class="bi bi-star-fill me-1"></i> Avaliar Aula
                    </button>`;
                
                colCertificado = `
                    <button class="btn btn-sm btn-light text-muted border" disabled title="Avalie para liberar">
                        <i class="bi bi-lock-fill me-1"></i> Bloqueado
                    </button>`;
            }
        }

        return `
        <tr>
            <td>
                <div class="fw-bold">${aula.materia}</div>
                <small class="text-muted">Prof. ${aula.professor}</small>
            </td>
            <td class="align-middle">${aula.data}</td>
            <td class="align-middle">
                <span class="badge ${aula.cor}">${aula.status}</span>
                ${aula.status !== 'Concluído' ? '<br><small class="text-primary" style="cursor:pointer">Link da aula</small>' : ''}
            </td>
            <td class="align-middle text-center">
                ${colAvaliacao}
            </td>
            <td class="text-end align-middle">
                ${colCertificado}
            </td>
        </tr>`;
    }).join('');
}

function renderPainelAluno(usuario) {
    return `
    <div class="container py-5">
        <div class="row mb-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold text-primary">Área do Aluno</h2>
                <p class="text-muted">Bons estudos, <strong>${usuario.nome}</strong>!</p>
            </div>
            <div class="col-auto">
                <button class="btn botao-verde" data-route="explorar">
                    <i class="bi bi-search me-1"></i> Buscar Professor
                </button>
            </div>
        </div>

        <div class="row mb-5">
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light p-3 rounded-circle me-3 text-primary"><i class="bi bi-journal-bookmark fs-4"></i></div>
                        <div><h6 class="mb-0 text-muted">Aulas Marcadas</h6><h3 class="fw-bold mb-0">4</h3></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light p-3 rounded-circle me-3 text-success"><i class="bi bi-clock-history fs-4"></i></div>
                        <div><h6 class="mb-0 text-muted">Horas Estudadas</h6><h3 class="fw-bold mb-0">12h</h3></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold">Minhas Aulas</h5></div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4">Matéria</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th class="text-center">Avaliação</th>
                                <th class="text-end pe-4">Certificado</th>
                            </tr>
                        </thead>
                        <tbody class="ps-4">${gerarTabelaAluno()}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

// --- TABELAS DO PROFESSOR (MANTIDAS IGUAIS) ---
function gerarTabelaProfessor() {
    if (mockHorariosProfessor.length === 0) return `<tr><td colspan="5" class="text-center">Sem horários.</td></tr>`;
    
    return mockHorariosProfessor.map(item => {
        let acoes = '';
        if (item.status === 'Agendado') {
            acoes = `<button class="btn btn-sm btn-success me-1" onclick="window.solicitarGerenciamento(${item.id}, 'concluir')" title="Concluir Aula"><i class="bi bi-check-lg"></i></button>
                     <button class="btn btn-sm btn-outline-danger" onclick="window.solicitarGerenciamento(${item.id}, 'cancelar')" title="Cancelar"><i class="bi bi-trash"></i></button>`;
        } else if (item.status === 'Livre') {
            acoes = `<button class="btn btn-sm btn-outline-danger" onclick="window.solicitarGerenciamento(${item.id}, 'excluir')" title="Excluir Horário"><i class="bi bi-trash"></i></button>`;
        } else if (item.status === 'Concluído') {
            acoes = `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Finalizado</span>`;
        }

        return `
        <tr>
            <td>
                <div class="fw-bold text-primary">${item.disciplina || 'Geral'}</div>
                <small class="text-muted">${item.assunto || ''}</small>
                ${item.nivel ? `<br><span class="badge bg-light text-secondary border" style="font-size: 0.6rem">${item.nivel}</span>` : ''}
            </td>
            <td class="align-middle">
                <div class="fw-bold">${item.dia}</div>
                <small>${item.hora}</small>
            </td>
            <td class="align-middle">
                <span class="badge ${item.cor}">${item.status}</span>
                ${item.aluno !== '-' ? `<div class="small mt-1"><i class="bi bi-person"></i> ${item.aluno}</div>` : ''}
            </td>
            <td class="text-end align-middle">${acoes}</td>
        </tr>`;
    }).join('');
}

function renderPainelProfessor(usuario) {
    setTimeout(atualizarSelectDoModal, 100);

    return `
    <div class="container py-5">
        <div class="row mb-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold text-primary">Painel do Professor</h2>
                <p class="text-muted">Bem vindo, <strong>${usuario.nome}</strong>!</p>
            </div>
            <div class="col-auto">
                <button class="btn botao-verde" onclick="window.abrirModalNovoHorario()">
                    <i class="bi bi-plus-circle me-1"></i> Novo Horário
                </button>
            </div>
        </div>

        <div class="row mb-5">
            <div class="col-md-4 mb-3"><div class="card border-0 shadow-sm p-3 h-100"><div class="d-flex align-items-center"><div class="bg-light p-3 rounded-circle me-3 text-warning"><i class="bi bi-people fs-4"></i></div><div><h6 class="mb-0 text-muted">Alunos</h6><h3 class="fw-bold mb-0">15</h3></div></div></div></div>
            <div class="col-md-4 mb-3"><div class="card border-0 shadow-sm p-3 h-100"><div class="d-flex align-items-center"><div class="bg-light p-3 rounded-circle me-3 text-info"><i class="bi bi-patch-check fs-4"></i></div><div><h6 class="mb-0 text-muted">Horas</h6><h3 class="fw-bold mb-0">24h</h3></div></div></div></div>
            
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3 h-100">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex align-items-center">
                            <div class="bg-light p-3 rounded-circle me-3 text-primary"><i class="bi bi-book fs-4"></i></div>
                            <div><h6 class="mb-1 text-muted">Leciono:</h6><div>${gerarTagsDisciplinas()}</div></div>
                        </div>
                        <button class="btn btn-sm btn-link text-decoration-none" data-bs-toggle="modal" data-bs-target="#modal-disciplinas">Editar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold">Minha Agenda</h5></div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr><th class="ps-4">Conteúdo</th><th>Dia/Hora</th><th>Status</th><th class="text-end pe-4">Ação</th></tr>
                        </thead>
                        <tbody class="ps-4">${gerarTabelaProfessor()}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

export function obterConteudoDashboard() {
    const usuario = authService.getUsuario();
    if (!usuario) return '';
    return (usuario.tipo === 'professor') ? renderPainelProfessor(usuario) : renderPainelAluno(usuario);
}