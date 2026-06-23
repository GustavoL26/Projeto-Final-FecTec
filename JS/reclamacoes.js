document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';

    const usuario_atual_id = localStorage.getItem('usuario_id');
    const tipo_usuario_atual = localStorage.getItem('tipoUsuario');

    const localHTML = document.getElementById('nome_local');
    const lista_reclamacoes = document.getElementById('lista_reclamacoes');

    let grupos = [];
    let indiceLocal = 0;

    async function carregarReclamacoes(){
        try{
            const resposta = await fetch(`${API_URL}/listar_reclamacoes`);
            const dados = await resposta.json();

            let organizados = {};

            dados.forEach(rec => {
                if(!organizados[rec.local]){
                    organizados[rec.local] = [];
                }

                organizados[rec.local].push(rec);
            });

            grupos = Object.keys(organizados).map(local => ({
                local,
                reclamacoes: organizados[local]
            }));

            if (grupos.length === 0){
                localHTML.textContent = '';

                lista_reclamacoes.innerHTML = `
                    <div class="card_reclamacao vazio"></div>
                `;

                document.getElementById('btn_subir').classList.add('oculto');
                document.getElementById('btn_descer').classList.add('oculto');

                return;
            }

            mostrarLocal();
        } catch(e){
            console.log(e);
        }
    }

    function mostrarLocal(){
        const grupo = grupos[indiceLocal];

        if(!grupo) return;

        localHTML.textContent = grupo.local;

        let texto = "";

        grupo.reclamacoes.forEach(rec => {
            const dono = String(rec.criador_id) === String(usuario_atual_id) && String(rec.tipo_usuario) === String(tipo_usuario_atual);

            const botao_excluir = dono ? `
                <button class="btn_excluir" data-id="${rec.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            ` : '';

            texto += `
                <div class="item_reclamacao">
                    <h4>
                    Frequência: ${rec.frequencia}
                    </h4>

                    <p>
                    ${rec.descricao}
                    </p>

                    ${botao_excluir}
                </div>
            `;
        });

        lista_reclamacoes.innerHTML = texto;

        document.getElementById('btn_subir').classList.toggle('oculto', indiceLocal === 0);
        document.getElementById('btn_descer').classList.toggle('oculto' ,indiceLocal === grupos.length - 1);
    }

    document.getElementById('btn_descer').addEventListener('click', () => {
        if(indiceLocal < grupos.length-1){
            indiceLocal++;

            mostrarLocal();
        }
    });

    document.getElementById('btn_subir').addEventListener('click', () => {
        if(indiceLocal > 0){
            indiceLocal--;

            mostrarLocal();
        }
    });

    document.addEventListener('click', async e => {
        const botao = e.target.closest('.btn_excluir');

        if (!botao) return;

        const id = botao.dataset.id;

        if (confirm('Tem certeza de que deseja deletar permanentemente esta reclamação?')){
            try{
                const resposta = await fetch(`${API_URL}/excluir_reclamacao/${id}/${usuario_atual_id}/${tipo_usuario_atual}`, {
                    method:'DELETE'
                });

                if (resposta.ok){
                    await carregarReclamacoes();
                } else{
                    alert('Não foi possível excluir a reclamação no servidor.');
                } 
            } catch (erro){
                console.error('Erro ao tentar se comunicar com o servidor:', erro);
            }
        }
    });

    const menu_tipo = document.getElementById('menu_tipo');
    if (menu_tipo){
        menu_tipo.addEventListener('change', (event) => {
            const opcao_selecionada = event.target.value;
            if (opcao_selecionada === 'Sugestões de Projeto'){
                window.location.href = 'sugestoes_projeto.html';
            } else if (opcao_selecionada === 'Sugestões de Melhoria'){
                window.location.href = 'sugestoes_melhoria.html';
            }
        });
    }

    carregarReclamacoes();
});
