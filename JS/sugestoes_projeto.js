document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';
    const container_cards = document.getElementById('cards_votacao');

    const usuario_atual_id = localStorage.getItem('usuario_id');
    const tipo_usuario_atual = localStorage.getItem('tipoUsuario');

    if (!usuario_atual_id || !tipo_usuario_atual){
        alert('Sessão expirada. Faça o acesso novamente.');
        window.location.href = 'acesso_alunos.html';
        return;
    }

    async function carregar_sugestoesVotacao(){
        if (!container_cards) return;

        try {
            const resp = await fetch(`${API_URL}/listar_sugestoes`);
            const sugestoes = await resp.json();

            const dados_filtrados = Array.isArray(sugestoes) ? sugestoes.filter(sug => sug.tipo === 'Sugestão de projeto') : [];

            container_cards.innerHTML = '';

            const total_cards_exibiveis = Math.max(4, dados_filtrados.length);
            const votos_salvos = JSON.parse(localStorage.getItem('votos_escola')) || {};
            let cards_HTML = '';

            for (let i = 0; i < total_cards_exibiveis; i++){
                const sug = dados_filtrados[i];

                if (sug){
                    const sug_id = sug.id;
                    const dados_voto = votos_salvos[sug_id] || {sim: 0, nao: 0, usuarios: {}};

                    const voto_usuario_atual = dados_voto.usuarios?.[usuario_atual_id] || null;

                    const votou_sim = voto_usuario_atual === 'sim';
                    const votou_nao = voto_usuario_atual === 'nao';

                    const classe_sim = votou_sim ? 'btn_voto_opcao ativo' : 'btn_voto_opcao';
                    const classe_nao = votou_nao ? 'btn_voto_opcao ativo' : 'btn_voto_opcao';

                    const texto_remover = (votou_sim || votou_nao) 
                        ? `<p class="texto_remover_voto" data-id="${sug_id}">Remover voto</p>` 
                        : `<p class="texto_remover_voto oculto" data-id="${sug_id}">Remover voto</p>`;
                    
                    console.log('Sugestão:', sug.criador_id, sug.tipo_usuario);

                    const dono = String(sug.criador_id) === String(usuario_atual_id) && String(sug.tipo_usuario) === String(tipo_usuario_atual);
                    const icone_lixeira = dono 
                    ? `
                    <button class="btn_excluir_sugestao" data-id="${sug.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    ` 
                    : '';

                    cards_HTML += `
                        <div class="bloco_votacao">
                            <div class="card_projeto card_estrutura_votacao">
                                <div class="conteudo_card" style="padding: 15px; text-align: center;">
                                    <strong><p>${sug.tipo}</p></strong>
                                    <p>${sug.descricao}</p>
                                </div>
                                ${icone_lixeira}
                            </div>

                            <div class="divisor_card_votacao">
                                <div class="bloco_voto">
                                    <span id="cont_sim_${sug_id}">${dados_voto.sim}</span>
                                    <button class="${classe_sim}" data-id="${sug_id}" data-tipo="sim">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                </div>
                                <div class="bloco_voto">
                                    <button class="${classe_nao}" data-id="${sug_id}" data-tipo="nao">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                    <span id="cont_nao_${sug_id}">${dados_voto.nao}</span>
                                </div>
                            </div>
                            <div class="zona_remover">
                                ${texto_remover}
                            </div>
                        </div>
                    `;
                } else {
                    cards_HTML += `
                        <div class="bloco_votacao">
                            <div class="card_projeto card_estrutura_votacao vazio"></div>
                            <div class="divisor_card_votacao" style="visibility: hidden;"></div>
                            <div class="zona_remover" style="visibility: hidden;"></div>
                        </div>
                    `;
                }
            }
            
            container_cards.innerHTML = cards_HTML;

        } catch (err) {
            console.error('Erro ao buscar sugestões:', err);
        }
    }

    if (container_cards){
        container_cards.addEventListener('click', async (event) => {
            const botao = event.target.closest('.btn_voto_opcao');
            const texto_remocao = event.target.closest('.texto_remover_voto');
            const botao_excluir = event.target.closest('.btn_excluir_sugestao');

            if (botao_excluir) {
                const id_deletar = botao_excluir.getAttribute('data-id');
                
                if (confirm('Tem certeza de que deseja deletar permanentemente esta sugestão?')) {
                    try {
                        const resposta = await fetch(`${API_URL}/excluir_sugestao/${id_deletar}/${usuario_atual_id}/${tipo_usuario_atual}`, {
                            method: 'DELETE'
                        });

                        if (resposta.ok) {
                            carregar_sugestoesVotacao(); 
                        } else {
                            alert('Não foi possível excluir a sugestão no servidor.');
                        }
                    } catch (erro) {
                        console.error('Erro ao tentar se comunicar com o servidor:', erro);
                    }
                }
                return; 
            }

            let votos_atuais = JSON.parse(localStorage.getItem('votos_escola')) || {};

            if (botao){
                const id = botao.getAttribute('data-id');
                const tipo_voto = botao.getAttribute('data-tipo');

                if (!votos_atuais[id]){
                    votos_atuais[id] = {sim: 0, nao: 0, usuarios: {}};
                }

                const item = votos_atuais[id];

                if (!item.usuarios){
                    item.usuarios = {};
                }

                const voto_anterior = item.usuarios[usuario_atual_id];

                if (voto_anterior === tipo_voto){
                    item[tipo_voto] = Math.max(0, item[tipo_voto] - 1);

                    delete item.usuarios[usuario_atual_id];
                } else{
                    if (voto_anterior){
                        item[voto_anterior] = Math.max(0, item[voto_anterior] - 1);
                    }

                    item[tipo_voto] += 1;

                    item.usuarios[usuario_atual_id] = tipo_voto;
                }

                localStorage.setItem('votos_escola', JSON.stringify(votos_atuais));
                carregar_sugestoesVotacao();
            }

            if (texto_remocao){
                const id = texto_remocao.getAttribute('data-id');

                if (votos_atuais[id] && votos_atuais[id].usuarios?.[usuario_atual_id]){
                    const tipo_anterior = votos_atuais[id].usuarios[usuario_atual_id];

                    votos_atuais[id][tipo_anterior] = Math.max(0, votos_atuais[id][tipo_anterior] - 1);

                    delete votos_atuais[id].usuarios[usuario_atual_id];

                    localStorage.setItem('votos_escola', JSON.stringify(votos_atuais));
                    carregar_sugestoesVotacao();
                }
            }
        });
    }

    const menu_tipo = document.getElementById('menu_tipo');
    if (menu_tipo){
        menu_tipo.addEventListener('change', (event) => {
            const opcao_selecionada = event.target.value;
            if (opcao_selecionada === 'Sugestões de Melhoria'){
                window.location.href = 'sugestoes_melhoria.html';
            } else if (opcao_selecionada === 'Reclamações'){
                window.location.href = 'reclamacoes.html';
            }
        });
    }

    carregar_sugestoesVotacao();
});
