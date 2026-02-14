// --- 1. CONFIGURAÇÃO DO FIREBASE ---
// AQUI: Cole as chaves que você pegou no console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAtZgEGx1jA4EuV5PkPrV6U-qyqt4JTysc",
  authDomain: "dabrowska-biscoitaria.firebaseapp.com",
  databaseURL: "https://dabrowska-biscoitaria-default-rtdb.firebaseio.com",
  projectId: "dabrowska-biscoitaria",
  storageBucket: "dabrowska-biscoitaria.firebasestorage.app",
  messagingSenderId: "123595440583",
  appId: "1:123595440583:web:4867032ac98ff8275899e2"
};

// Inicializa o Firebase
try {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();
    var usarFirebase = true;
    console.log("Firebase conectado!");
} catch (e) {
    console.log("Firebase não configurado ainda. Usando modo offline.");
    var usarFirebase = false;
    // Libera os botões caso não tenha Firebase configurado para teste visual
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.innerText = "Adicionar (Modo Teste)";
        btn.disabled = false;
        btn.style.backgroundColor = "#3E2723";
    });
}

// --- 2. DADOS DOS PRODUTOS ---
const produtosMap = {
    'cookie_americano': { nome: 'Cookie Americano', preco: 6.00, idBotao: 'btn-cookie' },
    'casadinho': { nome: 'Casadinho de Goiabada', preco: 18.00, idBotao: 'btn-casadinho' },
    'mix_pote': { nome: 'Mix Dabrowska (Pote)', preco: 45.00, idBotao: 'btn-mix' },
    'casadinho_chocolate': { nome: 'Casadinho de Chocolate', preco: 18.00, idBotao: 'btn-casadinho-chocolate' },
    'casadinho_maracuja': { nome: 'Casadinho de Maracujá', preco: 18.00, idBotao: 'btn-casadinho-maracuja' },
    'casadinho_queijo': { nome: 'Casadinho de Queijo', preco: 18.00, idBotao: 'btn-casadinho-queijo' },
    'fit_amendoim': { nome: 'Cookie Fit', preco: 18.00, idBotao: 'btn-fit-amendoim' },
    'cracker_parmesao': { nome: 'Cracker de parmesão', preco: 18.00, idBotao: 'btn-cracker' },
    'bolo_sgluten': { nome: 'Bolo Sem Glutén', preco: 20.00, idBotao: 'btn-bolo-sgluten' },
};

// --- 3. LÓGICA DO CARRINHO ---
let carrinho = [];

// AQUI: Coloque seu número real (apenas números, com 55 e DDD)
const SEU_NUMERO_WHATSAPP = "5571999092470"; 

// Função que monitora o estoque em Tempo Real
function monitorarEstoque() {
    if (!usarFirebase) return;

    db.ref('estoque').on('value', (snapshot) => {
        const estoque = snapshot.val();
        
        // Percorre cada produto e atualiza o botão correspondente
        for (let key in produtosMap) {
            const qtd = estoque ? (estoque[key] || 0) : 0;
            const btn = document.getElementById(produtosMap[key].idBotao);
            const card = btn.parentElement;

            // Remove avisos antigos para não duplicar
            let avisoAntigo = card.querySelector('.aviso-estoque');
            if(avisoAntigo) avisoAntigo.remove();

            if (qtd > 0) {
                // TEM ESTOQUE
                btn.disabled = false;
                btn.innerText = "Adicionar";
                btn.style.backgroundColor = "#3E2723"; 
                
                // Cria aviso de quantidade
                let aviso = document.createElement('small');
                aviso.className = 'aviso-estoque';
                aviso.style.color = '#C05640';
                aviso.style.display = 'block';
                aviso.innerText = `Restam apenas ${qtd} un!`;
                btn.after(aviso);

            } else {
                // SEM ESTOQUE
                btn.disabled = true;
                btn.innerText = "Esgotado :(";
                btn.style.backgroundColor = "#ccc";
            }
        }
    });
}

// Inicia o monitoramento
monitorarEstoque();

// Adicionar ao Carrinho (local)
function adicionarAoCarrinho(chaveFirebase) {
    const produto = produtosMap[chaveFirebase];
    carrinho.push({ nome: produto.nome, preco: produto.preco });
    atualizarCarrinho();
    abrirCarrinho();
}

// Remover item do carrinho
function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// Atualiza visual do carrinho
function atualizarCarrinho() {
    const lista = document.getElementById('listaItens');
    const totalSpan = document.getElementById('valorTotal');
    const contador = document.getElementById('contador');
    
    lista.innerHTML = '';
    let total = 0;

    if(carrinho.length === 0) {
        lista.innerHTML = '<p style="color: #999; text-align: center; margin-top: 20px;">Seu carrinho está vazio.</p>';
    }

    carrinho.forEach((item, index) => {
        total += item.preco;
        lista.innerHTML += `
            <div class="item-carrinho">
                <span>${item.nome}</span>
                <div>
                    <span style="font-weight:bold; color: var(--cor-terracota);">R$ ${item.preco.toFixed(2)}</span>
                    <button onclick="removerItem(${index})" style="color:red; border:none; background:none; cursor:pointer; margin-left:10px; font-size: 1.2rem;">&times;</button>
                </div>
            </div>
        `;
    });

    totalSpan.innerText = total.toFixed(2);
    contador.innerText = carrinho.length;
}

// Abrir/Fechar Modal
function abrirCarrinho() {
    document.getElementById('modalCarrinho').style.display = 'flex';
}

function fecharCarrinho() {
    document.getElementById('modalCarrinho').style.display = 'none';
}

// Enviar pedido para o WhatsApp
function enviarWhatsapp() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    let mensagem = "Olá! Vim pelo site da Dabrowska e gostaria de encomendar:%0A%0A";
    let total = 0;

    carrinho.forEach(item => {
        mensagem += `- ${item.nome} (R$ ${item.preco.toFixed(2)})%0A`;
        total += item.preco;
    });

    mensagem += `%0A*Total Estimado: R$ ${total.toFixed(2)}*`;
    mensagem += "%0A%0AGostaria de saber a taxa de entrega e finalizar o pagamento!";

    window.open(`https://wa.me/${SEU_NUMERO_WHATSAPP}?text=${mensagem}`, '_blank');
}

// Fechar ao clicar fora do modal
window.onclick = function(event) {
    const modal = document.getElementById('modalCarrinho');
    if (event.target == modal) {
        fecharCarrinho();
    }
}