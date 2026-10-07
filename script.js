const cardPrincipal = document.getElementById('card-principal');
const menuPrincipal = document.getElementById('menu-principal');
const timelineSection = document.getElementById('timeline-section');
const boasVindasSection = document.getElementById('boas-vindas-section');
const cadastroSection = document.getElementById('cadastro-section');
const expulsaoSection = document.getElementById('expulsao-section');
const revelacaoSection = document.getElementById('revelacao-section');
const avisoSection = document.getElementById('aviso-section');
const quizSection = document.getElementById('quiz-section');
const telaFinal = document.getElementById('tela-final');
const musicaFundo = document.getElementById('bg-music');
const somTensao = document.getElementById('tension-sound');
const volumeModal = document.getElementById('volume-modal');
const perguntaDica = document.getElementById('pergunta-dica');
const btnContinuar = document.getElementById('btn-continuar');
const btnInstall = document.getElementById('btn-install');
const appStatus = document.getElementById('app-status');
let promptInstalacao = null;

// Armazenamento seguro (não quebra em modo privado)
const store = {
    get(k, padrao) { try { const v = localStorage.getItem(k); return v === null ? padrao : v; } catch { return padrao; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignora */ } }
};
let volumeAtual = Math.min(1, Math.max(0, parseFloat(store.get('rapha:volume', '0.4')) || 0.4));

// Inicia com animação de slide-up
menuPrincipal.style.display = 'block';
menuPrincipal.style.opacity = '1';
menuPrincipal.classList.add('fade-in-up');

let temaAtual = store.get('rapha:tema', 'crepusculo');

function mudarTema(tema) {
    temaAtual = tema;
    store.set('rapha:tema', tema);
    if (tema === 'verao') {
        document.body.classList.add('theme-verao');
    } else {
        document.body.classList.remove('theme-verao');
    }
}

function toggleQuickVolumeModal() {
    volumeModal.style.display = (volumeModal.style.display === 'block') ? 'none' : 'block';
}

function mudarVolume(valor) {
    volumeAtual = Math.min(1, Math.max(0, parseFloat(valor)));
    musicaFundo.volume = volumeAtual;
    store.set('rapha:volume', volumeAtual);
    // mantém os dois sliders (menu e botão flutuante) sincronizados
    document.querySelectorAll('input[type="range"]').forEach(r => { r.value = volumeAtual; });
    if (musicaFundo.paused && volumeAtual > 0) {
        musicaFundo.play().catch(() => console.log("Áudio aguardando interação"));
    }
}

function mostrarSobre() {
    alert("Coração do Rapha - Edição Verão 1.0\nInspirado em 'Me Chama pelo Seu Nome'.\nCriado com todo o amor para o meu namorado! 🍑✨");
}

function atualizarBotoesMenu() {
    const salvo = parseInt(store.get('rapha:quiz', '0'), 10);
    const temProgresso = salvo > 0 && salvo < perguntas.length;
    btnContinuar.style.display = temProgresso ? 'flex' : 'none';
}

function atualizarStatusApp() {
    if (!appStatus) return;
    if (!navigator.onLine) {
        appStatus.innerText = 'Modo offline ativo. O verão continua salvo neste aparelho.';
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
        appStatus.innerText = 'App instalado e pronto para abrir em tela cheia.';
    } else if (promptInstalacao) {
        appStatus.innerText = 'Dica: instale para abrir como aplicativo na tela inicial.';
    } else {
        appStatus.innerText = 'Tudo pronto para jogar. O progresso fica salvo neste aparelho.';
    }
}

function continuarJogo() {
    const salvo = parseInt(store.get('rapha:quiz', '0'), 10);
    if (salvo > 0 && salvo < perguntas.length) {
        indiceAtual = salvo;
        transicaoSuave(menuPrincipal, quizSection, carregarPergunta);
    }
}

function reiniciarProgresso() {
    if (!confirm('Reiniciar o quiz salvo neste aparelho?')) return;
    store.set('rapha:quiz', 0);
    indiceAtual = 0;
    atualizarBotoesMenu();
    atualizarStatusApp();
}

async function instalarApp() {
    if (!promptInstalacao) {
        alert('Quando o navegador liberar a instalação, este botão aparece automaticamente. No iPhone/iPad, use Compartilhar > Adicionar à Tela de Início.');
        return;
    }
    promptInstalacao.prompt();
    await promptInstalacao.userChoice.catch(() => null);
    promptInstalacao = null;
    btnInstall.style.display = 'none';
    atualizarStatusApp();
}

function irParaTimeline() {
    transicaoSuave(menuPrincipal, timelineSection);
}

function voltarMenuTimeline() {
    atualizarBotoesMenu();
    transicaoSuave(timelineSection, menuPrincipal);
}

function irParaBoasVindas() {
    transicaoSuave(menuPrincipal, boasVindasSection);
}

function irParaCadastro() {
    transicaoSuave(boasVindasSection, cadastroSection);
}

function tentarCadastro() {
    const nome = document.getElementById('nome-inquilino').value.trim().toLowerCase();
    const motivo = document.getElementById('motivo').value.trim();
    const erro = document.getElementById('cadastro-erro');
    const btn = document.getElementById('btn-cadastro');
    if (btn.disabled) return; // evita envio duplo (Enter + clique)

    if (nome === "" || motivo === "") {
        mostrarErro(erro);
    } else if (!nome.includes("rafa") && !nome.includes("rafael")) {
        erro.classList.remove('show');
        
        if (somTensao) {
            somTensao.currentTime = 0;
            somTensao.play().catch(e => console.log("Áudio bloqueado"));
        }

        btn.innerHTML = '<i class="fa-solid fa-fingerprint"></i> Verificando biometria...';
        btn.disabled = true;

        setTimeout(() => {
            transicaoSuave(cadastroSection, expulsaoSection);
            cardPrincipal.classList.add('horror-mode');
            btn.innerHTML = 'Enviar Solicitação <i class="fa-solid fa-paper-plane"></i>';
            btn.disabled = false;
        }, 2000);

    } else {
        erro.classList.remove('show');
        
        if (somTensao) {
            somTensao.pause();
            somTensao.currentTime = 0;
        }

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando dados...';
        btn.disabled = true;

        setTimeout(() => {
            transicaoSuave(cadastroSection, revelacaoSection);
        }, 2500); 
    }
}

function voltarCadastro() {
    if (somTensao) {
        somTensao.pause();
        somTensao.currentTime = 0;
    }
    cardPrincipal.classList.remove('horror-mode');
    transicaoSuave(expulsaoSection, cadastroSection);
}

function verificarIdentidade() {
    musicaFundo.volume = volumeAtual;
    musicaFundo.play().catch(error => console.log("Áudio bloqueado pelo navegador."));
    transicaoSuave(revelacaoSection, avisoSection);
}

function iniciarQuiz() {
    // retoma de onde parou, se ele fechou o app no meio do quiz
    const salvo = parseInt(store.get('rapha:quiz', '0'), 10);
    indiceAtual = (salvo > 0 && salvo < perguntas.length) ? salvo : 0;
    transicaoSuave(avisoSection, quizSection, carregarPergunta);
}

const perguntas = [
    { 
        pergunta: "Qual é a minha cor favorita?", 
        opcoes: ["Verde", "Azul", "Vermelho"], 
        resposta: "Azul", 
        dicaAzul: "💡 Dica secreta: Olhe bem para o tema azul que você escolheu no início do jogo... 😉" 
    },
    { 
        pergunta: "Como a gente ficou pela primeira vez?", 
        opcoes: ["No cinema", "Bêbados na festa da Queixada na Musiva", "Num barzinho calmo"], 
        resposta: "Bêbados na festa da Queixada na Musiva" 
    },
    { 
        pergunta: "Em qual data exata eu te mandei mensagem no Instagram dando os parabéns?", 
        opcoes: ["31 de Agosto de 2025", "01 de Setembro de 2025", "16 de Setembro de 2025"], 
        resposta: "01 de Setembro de 2025" 
    },
    { 
        pergunta: "Onde foi o nosso primeiro encontro oficial?", 
        opcoes: ["Num restaurante chique", "Numa lanchonete na praça", "No meu aniversário, porque não tinha mais ninguém para sair comigo e você aceitou"], 
        resposta: "No meu aniversário, porque não tinha mais ninguém para sair comigo e você aceitou" 
    },
    { 
        pergunta: "Onde foi que eu te pedi em namoro oficial?", 
        opcoes: ["Num restaurante", "Na frente da faculdade", "No carro no seu condomínio"], 
        resposta: "No carro no seu condomínio" 
    },
    { 
        pergunta: "Qual é a data exata do meu aniversário?", 
        opcoes: ["10 de Setembro", "16 de Setembro", "22 de Outubro"], 
        resposta: "16 de Setembro" 
    },
    { 
        pergunta: "Qual música você disse que é a nossa cara?", 
        opcoes: ["Diet Pepsi", "Summer Forever", "Obsessed"], 
        resposta: "Summer Forever" 
    },
    { 
        pergunta: "Qual foi o show inesquecível que fomos juntos no Rio de Janeiro?", 
        opcoes: ["Coldplay", "The Weeknd", "Rosalía"], 
        resposta: "Rosalía" 
    },
    { 
        pergunta: "Em qual jogo você passa mais raiva comigo?", 
        opcoes: ["Valorant", "Overwatch", "League of Legends"], 
        resposta: "Overwatch" 
    },
    { 
        pergunta: "O que eu mais gosto em você?", 
        opcoes: ["Seu humor duvidoso", "Seu sorriso", "Sua dedicação", "É simplesmente tudo"], 
        resposta: "É simplesmente tudo" 
    },
    { 
        pergunta: "Qual série você está me enrolando séculos para terminar?", 
        opcoes: ["The Handmaid's Tale", "Stranger Things", "Breaking Bad"], 
        resposta: "The Handmaid's Tale" 
    },
    { 
        pergunta: "O que você fez que me deixou genuinamente feliz ao ponto de chorar?", 
        opcoes: ["Fez uma festa surpresa", "Aguentou a distância do intercâmbio", "Me deu um presente feito à mão"], 
        resposta: "Aguentou a distância do intercâmbio" 
    },
    { 
        pergunta: "Qual música do Cigarettes After Sex eu dediquei para você?", 
        opcoes: ["Apocalypse", "Sunsetz", "K."], 
        resposta: "K." 
    },
    { 
        pergunta: "Em qual faculdade eu, Raphael, faço Engenharia de Software?", 
        opcoes: ["UFMT", "Univag", "Unic"], 
        resposta: "Univag" 
    },
    { 
        pergunta: "Em qual instituição eu, Raphael, trabalho/estágio atualmente?", 
        opcoes: ["CREA-MT", "Ginco", "Jusbrasil"], 
        resposta: "CREA-MT" 
    },
    { 
        pergunta: "Qual foi a sensação exata no dia 12/07/2026 quando nos reencontramos após o intercâmbio?", 
        opcoes: ["Achei normal", "Queria ir pra casa dormir", "Decidi que nunca mais ia te soltar na vida"], 
        resposta: "Decidi que nunca mais ia te soltar na vida" 
    }
];

let indiceAtual = 0;
const perguntaTexto = document.getElementById('pergunta-texto');
const opcoesContainer = document.getElementById('opcoes-container');
const progressBar = document.getElementById('progress-bar');
const mensagemErro = document.getElementById('mensagem-erro');
const contadorPerguntas = document.getElementById('contador-perguntas');

function atualizarProgresso() {
    const porcentagem = (indiceAtual / perguntas.length) * 100;
    progressBar.style.width = porcentagem + '%';
    contadorPerguntas.innerText = `Pergunta ${indiceAtual + 1} de ${perguntas.length}`;
}

function carregarPergunta() {
    mensagemErro.classList.remove('show');
    const dados = perguntas[indiceAtual];
    perguntaTexto.innerText = dados.pergunta;
    
    if (dados.dicaAzul && temaAtual === 'crepusculo') {
        perguntaDica.innerText = dados.dicaAzul;
        perguntaDica.style.display = 'block';
    } else {
        perguntaDica.style.display = 'none';
    }

    opcoesContainer.innerHTML = ''; 
    
    dados.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.classList.add('btn-opcao');
        btn.innerHTML = `<i class="fa-regular fa-circle"></i> ${opcao}`; // Adicionado ícone de check nas opções!
        
        if (opcao === "É simplesmente tudo") {
            btn.style.background = "transparent";
            btn.style.border = "none";
            btn.style.boxShadow = "none";
            btn.style.color = "transparent";
            btn.style.pointerEvents = "none";
            btn.style.transition = "all 0.8s ease";
            btn.id = "btn-secreto";
            btn.innerHTML = opcao; // Remove icone do secreto
        }

        btn.onclick = () => verificarResposta(opcao, dados.resposta, dados.pergunta);
        opcoesContainer.appendChild(btn);
    });
    
    atualizarProgresso();
}

function verificarResposta(escolha, correta, textoPergunta) {
    if (escolha === correta) {
        if (correta === "The Handmaid's Tale") {
            mostrarZoeiraSerie();
        } else if (textoPergunta === "Em qual jogo você passa mais raiva comigo?") {
            mostrarContratoOverwatch(); 
        } else {
            avancarPergunta();
        }
    } else {
        if (textoPergunta === "O que eu mais gosto em você?") {
            mensagemErro.innerText = "Sério que você acha que eu escolheria só isso? Procure a resposta invisível... 👀";
            
            const btnSecreto = document.getElementById('btn-secreto');
            if (btnSecreto) {
                btnSecreto.style.color = "var(--primary)";
                btnSecreto.style.border = "2px dashed var(--accent)";
                btnSecreto.style.background = "var(--card-bg)";
                btnSecreto.style.pointerEvents = "auto";
            }
        } else {
            mensagemErro.innerText = "Ops, errou! Tenta de novo, amor! 💔";
        }
        
        mostrarErro(mensagemErro);
    }
}

// ==== CONTRATO COM CSS DINÂMICO E FLEXBOX ====
function mostrarContratoOverwatch() {
    const contrato = document.createElement('div');
    contrato.id = 'modal-contrato';
    contrato.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999; padding: 20px; backdrop-filter: blur(5px);">
            <div style="background:var(--card-bg); padding:35px 30px; border-radius:24px; text-align:center; max-width:450px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); border: 3px solid var(--accent); position: relative; max-height: 90vh; overflow-y: auto; animation: fadeInUp 0.4s ease;">
                <div style="font-size: 0.75rem; letter-spacing: 2px; color: var(--accent); font-weight: bold; margin-bottom: 5px;">REPÚBLICA INDEPENDENTE DOS NAMORADOS</div>
                <h2 style="color:var(--primary); font-size: 1.25rem; margin-bottom: 5px; font-family: 'Playfair Display', serif;"><i class="fa-solid fa-scale-balanced"></i> TERMO DE SUPORTE EM RANQUEADAS</h2>
                <p style="font-size: 0.75rem; color: var(--text-light); margin-bottom: 20px;">Processo nº 0912-2026 / Comarca do Coração</p>
                
                <div style="font-size: 0.85rem; color: var(--text-main); line-height: 1.6; text-align: left; background: rgba(27, 38, 59, 0.05); padding: 18px; border-radius: 12px; border: 1px solid rgba(194, 166, 68, 0.3); margin-bottom: 20px;">
                    <strong style="color: var(--primary);">PARTES ENVOLVIDAS:</strong><br>
                    • <strong>Contratante (Vítima da Mira):</strong> Rafael, dono oficial do coração<br>
                    • <strong>Contratado (Suporte Titular):</strong> Raphael, namorado e apoio emocional registrado<br><br>
                    <strong style="color: var(--primary);">CLÁUSULAS JURÍDICAS:</strong><br>
                    <strong>1ª</strong> O Contratante obriga-se irrevogavelmente a manter o apoio emocional incondicional mesmo após derrotas humilhantes.<br><br>
                    <strong>2ª</strong> Fica expressamente vedado o uso de termos ofensivos no chat de voz.<br><br>
                    <strong>3ª</strong> O amor verdadeiro sempre vence a mira de batata. ❤️
                </div>

                <div style="text-align: left; margin-bottom: 20px;">
                    <label style="font-size: 0.8rem; color: var(--primary); font-weight: 600; display: block; margin-bottom: 5px;">Assinatura Digital Obrigatória:</label>
                    <input type="text" id="input-assinatura" placeholder="Ex: Rafael..." style="width: 100%; padding: 12px; border: 2px solid var(--accent); border-radius: 10px; font-family: 'Playfair Display', serif; font-size: 0.95rem; outline: none; background: #fff;">
                    <div id="erro-assinatura" style="color: var(--error); font-size: 0.8rem; margin-top: 5px; display: none;">Por favor, assine o documento para prosseguir, Excelência! ✍️</div>
                </div>

                <button onclick="validarEAssinarContrato()" style="display: flex; justify-content: center; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); color:var(--primary-dark); border:none; padding:15px; border-radius:14px; cursor:pointer; font-weight:700; font-family: 'Poppins', sans-serif; font-size: 1rem; width: 100%; box-shadow: 0 5px 15px rgba(194, 166, 68, 0.3);">
                    <i class="fa-solid fa-file-signature"></i> Homologar e Assinar Contrato
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(contrato);
}

function validarEAssinarContrato() {
    const assinatura = document.getElementById('input-assinatura').value.trim();
    const erroAssinatura = document.getElementById('erro-assinatura');

    if (assinatura === "") {
        erroAssinatura.style.display = 'block';
    } else {
        document.getElementById('modal-contrato').remove();
        assinarEGuardarRecordacao();
    }
}

// ==== RECORDAÇÃO COM ANIMAÇÃO DE CARIMBO (PUM!) ====
function assinarEGuardarRecordacao() {
    const recordacao = document.createElement('div');
    recordacao.id = 'modal-recordacao';
    recordacao.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999; padding: 20px; backdrop-filter: blur(8px);">
            <div style="background:var(--card-bg); padding:35px 25px; border-radius:24px; text-align:center; max-width:420px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); border: 2px solid var(--accent); animation: fadeInUp 0.4s ease;">
                <i class="fa-solid fa-stamp carimbo-animacao" style="font-size: 3.5rem; color: var(--accent); margin-bottom: 15px; display: inline-block;"></i>
                <h2 style="color:var(--primary); font-size: 1.4rem; margin-bottom: 5px; font-family: 'Playfair Display', serif;">Contrato Homologado! 📜</h2>
                <p style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 15px;">Vigência até 09/12/2026 (1 Ano de Namoro)</p>
                
                <img src="img/casal.webp" alt="Nossa Foto" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent); margin-bottom: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.3); filter: sepia(10%);">
                
                <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.5; margin-bottom: 25px;">
                    Assinatura verificada em cartório pelo nosso amor! Você já pode salvar este termo oficial de recordação no seu tablet.
                </p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="window.print()" style="display: flex; justify-content: center; align-items: center; gap: 10px; background: #2b2d42; color: var(--accent); border: 2px solid var(--accent); padding: 14px; border-radius: 14px; cursor: pointer; font-weight: 600; font-family: 'Poppins', sans-serif;"><i class="fa-solid fa-download"></i> Salvar como PDF</button>
                    
                    <button onclick="document.getElementById('modal-recordacao').remove(); avancarPergunta();" style="display: flex; justify-content: center; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); color: var(--primary-dark); border: none; padding: 14px; border-radius: 14px; cursor: pointer; font-weight: 700; font-family: 'Poppins', sans-serif;"><i class="fa-solid fa-wand-magic-sparkles"></i> Continuar Aventura</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(recordacao);
}

// ==== ZOEIRA DA SÉRIE COM BOTÃO FUJÃO ====
function mostrarZoeiraSerie() {
    const zoeira = document.createElement('div');
    zoeira.id = 'modal-zoeira';
    zoeira.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:9999; padding: 20px; backdrop-filter: blur(5px);">
            <div id="card-zoeira" style="background:var(--card-bg); padding:40px 30px; border-radius:24px; text-align:center; max-width:400px; width: 100%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); border: 2px solid var(--accent); position: relative; animation: fadeInUp 0.4s ease;">
                <i class="fa-solid fa-face-rolling-eyes" style="font-size: 3.5rem; color: var(--primary); margin-bottom: 20px;"></i>
                <h2 style="color:var(--primary); font-size: 1.5rem; margin-bottom: 15px; font-family: 'Playfair Display', serif;">Aham, sei... 👀</h2>
                <p style="color:var(--text-light); margin-bottom: 25px; font-size: 1rem; line-height: 1.6;">"Ah, mas eu tô muito ocupado..."<br><br><strong style="color:var(--primary);">Não adianta dar desculpinhas, viu senhor Rafael? KKKKKK</strong><br>Trate de terminar logo!</p>
                
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center; position: relative; min-height: 55px;">
                    <button onclick="document.getElementById('modal-zoeira').remove(); avancarPergunta();" style="display: flex; justify-content: center; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); color:var(--primary-dark); border:none; padding:15px; border-radius:14px; cursor:pointer; font-weight:700; font-family: 'Poppins', sans-serif; font-size: 1rem; flex: 1; z-index: 2;"><i class="fa-solid fa-check"></i> Tá bom, amor 🙄</button>
                    
                    <button id="btn-fujao" style="background: rgba(27, 38, 59, 0.1); color: var(--primary); border:none; padding:15px; border-radius:14px; cursor:pointer; font-weight:600; font-family: 'Poppins', sans-serif; font-size: 1rem; transition: transform 0.2s; white-space: nowrap;">Tô muito ocupado!</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(zoeira);

    const btnFujao = document.getElementById('btn-fujao');

    const fugir = (e) => {
        if(e) e.preventDefault(); 
        btnFujao.style.position = 'fixed';
        const maxX = window.innerWidth - btnFujao.offsetWidth - 20;
        const maxY = window.innerHeight - btnFujao.offsetHeight - 20;
        const novoX = Math.max(20, Math.floor(Math.random() * maxX));
        const novoY = Math.max(20, Math.floor(Math.random() * maxY));

        btnFujao.style.left = novoX + 'px';
        btnFujao.style.top = novoY + 'px';
        const rotacao = Math.random() * 60 - 30; 
        btnFujao.style.transform = `rotate(${rotacao}deg)`;
    };

    btnFujao.addEventListener('mouseover', fugir);
    btnFujao.addEventListener('touchstart', fugir);
}

function avancarPergunta() {
    indiceAtual++;
    store.set('rapha:quiz', indiceAtual);
    atualizarBotoesMenu();
    if (indiceAtual < perguntas.length) {
        carregarPergunta();
    } else {
        finalizarQuiz();
    }
}

function mostrarErro(elementoMensagem) {
    elementoMensagem.classList.add('show');
    cardPrincipal.classList.add('shake');
    setTimeout(() => cardPrincipal.classList.remove('shake'), 400);
}

// ==== TRANSIÇÃO DESLIZANTE CINEMATOGRÁFICA ====
let emTransicao = false;
function transicaoSuave(esconder, mostrar, callback = null) {
    if (emTransicao) return; // ignora cliques durante a animação
    emTransicao = true;
    esconder.style.opacity = '0';
    setTimeout(() => {
        esconder.style.display = 'none';
        esconder.classList.remove('fade-in-up');

        mostrar.style.display = 'block';
        mostrar.classList.add('fade-in-up');

        void mostrar.offsetWidth;
        mostrar.style.opacity = '1';
        emTransicao = false;

        if (callback) callback();
    }, 400);
}

function finalizarQuiz() {
    progressBar.style.width = '100%';
    store.set('rapha:quiz', 0);
    atualizarBotoesMenu();
    setTimeout(() => {
        transicaoSuave(quizSection, telaFinal, soltarConfetes);
    }, 600);
}

function soltarConfetes() {
    if (typeof confetti !== 'function') return;
    var duration = 4000; 
    var end = Date.now() + duration;

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#c2a644', '#1b263b']});
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#c2a644', '#1b263b']});
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}
// ==== EFEITO SONORO GLOBAL DE CLIQUE ====
const somClick = document.getElementById('click-sound');

// Dispara o som de clique automaticamente em qualquer botão do jogo
document.addEventListener('click', (e) => {
    // Verifica se o elemento clicado é um botão ou está dentro de um botão
    const botao = e.target.closest('button');
    if (botao) {
        if (somClick) {
            somClick.currentTime = 0; // Reseta o áudio para permitir cliques rápidos seguidos
            somClick.play().catch(e => console.log("Áudio de clique aguardando interação"));
        }
    }
});

// ==== INICIALIZAÇÃO (restaura tema e volume salvos) ====
document.getElementById('tema-cores').value = temaAtual;
mudarTema(temaAtual);
musicaFundo.volume = volumeAtual;
document.querySelectorAll('input[type="range"]').forEach(r => { r.value = volumeAtual; });

// Fecha o painel de volume ao clicar fora ou apertar Esc
document.addEventListener('click', (e) => {
    if (volumeModal.style.display === 'block' && !e.target.closest('#volume-modal, .floating-audio-btn')) {
        volumeModal.style.display = 'none';
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') volumeModal.style.display = 'none';
    if (e.key !== 'Enter') return;
    const id = e.target.id;
    if (id === 'nome-inquilino' || id === 'motivo') tentarCadastro();
    else if (id === 'input-assinatura') validarEAssinarContrato();
});

// Pausa a música quando o app vai para segundo plano e retoma ao voltar
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (!musicaFundo.paused) { musicaFundo.dataset.retomar = '1'; musicaFundo.pause(); }
    } else if (musicaFundo.dataset.retomar === '1') {
        musicaFundo.dataset.retomar = '';
        musicaFundo.play().catch(() => {});
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstalacao = e;
    btnInstall.style.display = 'flex';
    atualizarStatusApp();
});

window.addEventListener('appinstalled', () => {
    promptInstalacao = null;
    btnInstall.style.display = 'none';
    atualizarStatusApp();
});

window.addEventListener('online', atualizarStatusApp);
window.addEventListener('offline', atualizarStatusApp);

// Service Worker (torna o PWA instalável e offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

atualizarBotoesMenu();
atualizarStatusApp();
