document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';
    
    const usuario_id = localStorage.getItem('usuario_id');
    const tipo_usuario = localStorage.getItem('tipoUsuario');

    if (!usuario_id){
        alert('Usuário não identificado. Faça o acesso novamente.');
        window.location.href = 'acesso_alunos.html';
        return;
    }

    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const tituloProposta = document.getElementById('titulo_proposta');

    if (tituloProposta && nomeUsuario){
        let textoAtual = tituloProposta.textContent;
        let textoNovo = textoAtual.replace('"Usuário"', nomeUsuario);
        tituloProposta.textContent = textoNovo;
    }

    const btnSugestao = document.getElementById('btn_sugestao');
    const btnReclamacao = document.getElementById('btn_reclamacao');

    const cardSugestao = document.getElementById('card_sugestao');
    const cardReclamacao = document.getElementById('card_reclamacao');

    const link_projetos = document.querySelector('.cards_projetos .card_clicavel');
    const link_melhorias = document.querySelector('.cards_melhorias .card_clicavel');
    const link_reclamacoes = document.querySelector('.cards_reclamacoes .card_clicavel');

    let Sugestoes = [];
    let Reclamacoes = [];

    if (btnSugestao && cardSugestao && cardReclamacao){
        btnSugestao.addEventListener('click', () => {
            if (cardSugestao.style.display === 'none' || cardSugestao.style.display === ''){
                cardSugestao.style.display = 'flex';
                cardReclamacao.style.display = 'none';
            } else {
                cardSugestao.style.display = 'none';
            }
        });
    }

    if (btnReclamacao && cardReclamacao && cardSugestao){
        btnReclamacao.addEventListener('click', () => {
            if (cardReclamacao.style.display === 'none' || cardReclamacao.style.display === ''){
                cardReclamacao.style.display = 'flex';
                cardSugestao.style.display = 'none';
            } else {
                cardReclamacao.style.display = 'none';
            }
        });
    }

    if (link_projetos){
        link_projetos.style.cursor = 'pointer';
        link_projetos.addEventListener('click', () => {
            localStorage.setItem('tipo_visualizacao', 'Sugestões de Projetos');
            window.location.href = 'sugestoes_projeto.html';
        });
    }

    if (link_melhorias){
        link_melhorias.style.cursor = 'pointer';
        link_melhorias.addEventListener('click', () => {
            localStorage.setItem('tipo_visualizacao', 'Sugestões de Melhorias');
            window.location.href = 'sugestoes_melhoria.html';
        });
    }

    if (link_reclamacoes){
        link_reclamacoes.style.cursor = 'pointer';
        link_reclamacoes.addEventListener('click', () => {
            localStorage.setItem('tipo_visualizacao', 'Reclamações');
            window.location.href = 'reclamacoes.html';
        });
    }

    if (cardSugestao){
        const btn_envio_sugestao = cardSugestao.querySelector('.btn_envio');

        if (btn_envio_sugestao){
            btn_envio_sugestao.addEventListener('click', async (event) => {
                event.preventDefault();

                const tipo = document.getElementById('tipo_sugestao').value;
                const descricao_sug = document.getElementById('desc_sugestao').value;

                if (!tipo || !descricao_sug.trim()){
                    alert('Por favor, preencha todos os campos da sugestão.');
                    return;
                }

                try{
                    const resposta = await fetch(`${API_URL}/enviar_sugestao`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({tipo, descricao: descricao_sug, criador_id: usuario_id, tipo_usuario: tipo_usuario})
                    });

                    const dados = await resposta.json();

                    if (resposta.status === 201){
                        alert('Sucesso: ' + dados.mensagem);

                        document.getElementById('tipo_sugestao').value = '';
                        document.getElementById('desc_sugestao').value = '';
                        cardSugestao.style.display = 'none';

                        await carregar_cardsBanco();
                    } else {
                        alert('Erro: ' + dados.mensagem);
                    }
                } catch (error){
                    console.error('Erro ao conectar com o servidor:', error);
                    alert('Não foi possível conectar ao servidor.');
                }
            });
        }
    }

    if (cardReclamacao){
        const btn_envio_reclamacao = cardReclamacao.querySelector('.btn_envio');

        if (btn_envio_reclamacao){
            btn_envio_reclamacao.addEventListener('click', async (event) => {
                event.preventDefault();

                const local = document.getElementById('local_reclamacao').value;
                const frequencia = document.getElementById('freq_reclamacao').value;
                const descricao_rec = document.getElementById('desc_reclamacao').value;

                if (!local || !frequencia || !descricao_rec.trim()){
                    alert('Por favor, preencha todos os campos da reclamação.');
                    return;
                }

                try{
                    const resposta = await fetch(`${API_URL}/enviar_reclamacao`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({local, frequencia, descricao: descricao_rec, criador_id: usuario_id, tipo_usuario: tipo_usuario})
                    });

                    const dados = await resposta.json();

                    if (resposta.ok){
                        alert('Sucesso: ' + dados.mensagem);

                        document.getElementById('local_reclamacao').value = '';
                        document.getElementById('freq_reclamacao').value = '';
                        document.getElementById('desc_reclamacao').value = '';
                        cardReclamacao.style.display = 'none';

                        await carregar_cardsBanco();
                    } else {
                        alert('Erro: ' + dados.mensagem);
                    }
                } catch (error){
                    console.error('Erro ao conectar com o servidor:', error);
                    alert('Não foi possível conectar ao servidor.');
                }
            });
        }
    }

    async function carregar_cardsBanco(){
        try{
            const respSug = await fetch(`${API_URL}/listar_sugestoes`);
            const sugestoes = await respSug.json();
            Sugestoes = Array.isArray(sugestoes) ? sugestoes : [];

            const divsProjetos = document.querySelectorAll('.cards_projetos .card_projetos');
            const divsMelhorias = document.querySelectorAll('.cards_melhorias .card_melhorias');

            const projetos_filtrados = Sugestoes.filter(sug => sug.tipo === 'Sugestão de projeto');
            const melhorias_filtradas = Sugestoes.filter(sug => sug.tipo === 'Sugestão de melhoria' || sug.tipo === 'Sugestão de melhorias');

            divsProjetos.forEach((div, index) => {
                const sug = projetos_filtrados[index];
                if (sug) {
                    div.innerHTML = `
                        <strong><p style="margin: 5px 0;">${sug.tipo}</p></strong> 
                        <p style="margin: 5px 0;">${sug.descricao}</p>
                    `;
                } else {
                    div.innerHTML = '';
                }
            });

            divsMelhorias.forEach((div, index) => {
                const sug = melhorias_filtradas[index];
                if (sug) {
                    div.innerHTML = `
                        <strong><p style="margin: 5px 0;">${sug.tipo}</p></strong> 
                        <p style="margin: 5px 0;">${sug.descricao}</p>
                    `;
                } else {
                    div.innerHTML = '';
                }
            });

        } catch (err){
            console.error('Erro ao listar sugestões:', err);
        }

        try{
            const respRec = await fetch(`${API_URL}/listar_reclamacoes`);
            const reclamacoes = await respRec.json();
            Reclamacoes = Array.isArray(reclamacoes) ? reclamacoes : [];

            const divsReclamacoes = document.querySelectorAll('.cards_reclamacoes .card_reclamacoes');

            divsReclamacoes.forEach((div, index) => {
                const rec = Reclamacoes[index];
                if (rec) {
                    div.innerHTML = `
                        <strong><p style="margin: 5px 0;">Local: ${rec.local}</p></strong>
                        <small><p style="margin: 2px 0;">(${rec.frequencia})</p></small>
                        <p style="margin: 5px 0;">${rec.descricao}</p>
                    `;
                } else {
                    div.innerHTML = '';
                }
            });

        } catch (err){
            console.error('Erro ao listar reclamações:', err);
        }
    }

    carregar_cardsBanco();
});
