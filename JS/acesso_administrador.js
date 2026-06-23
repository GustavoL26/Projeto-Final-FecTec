function acessarAdministradores(){
    const nome = document.getElementById('nome').value;
    const senha = document.getElementById('senha').value;

    const regex_nome = /^(?=.*[A-Z])[a-zA-ZÀ-ÿ\s]+$/;

    if (nome === '' || senha === ''){
        alert('Preencha todos os campos.');
        return;
    } else if (!regex_nome.test(nome)){
        alert('O nome deve conter apenas letras e ter, obrigatoriamente, pelo menos uma letra MAIÚSCULA.');
        return;
    } else if (nome.trim().length < 3){
        alert('O nome deve ter, no mínimo, 3 letras.');
        return;
    }

    const senhaUnica = 'a2D0m2Ns6TrDr';

    if (senha !== senhaUnica){
        alert('Senha única incorreta.');
        return;
    }

    const dadosFormulario = {
        tipoUsuario: 'administrador',
        nome,
        senha
    };
    console.log('Front-end: Tentando enviar os dados para o servidor...', dadosFormulario);

    fetch('http://localhost:3000/acesso', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosFormulario)
    })
    .then(resposta => resposta.json().then(dados => ({
        status: resposta.status,
        dados
    })))
    .then(({status, dados}) => {
        if (status === 200){
            localStorage.setItem('tipoUsuario', dados.tipo_usuario);
            localStorage.setItem('nomeUsuario', dados.nome);
            localStorage.setItem('usuario_id', dados.usuario_id);

            alert('Acesso realizado com sucesso!');
            window.location.href = 'principal.html';
        } else if (status === 401){
            alert('Nome ou senha incorretos.');
        } else{
            alert(dados.mensagem || 'Erro no servidor.');
        }
    })
    .catch (erro => {
        console.error(erro);
        alert('Não foi possível conectar ao servidor.');
    })
}

const btnAcessar = document.getElementById('btn_acessar');

if (btnAcessar){
    btnAcessar.addEventListener('click', acessarAdministradores);
}

const campoSenha = document.getElementById('senha');
const btnOlho = document.getElementById('btn_mostrar_senha');

if (btnOlho && campoSenha) {
    const iconeOlho = btnOlho.querySelector('i');
    
    btnOlho.addEventListener('click', () => {
        if (campoSenha.type === 'password'){
            campoSenha.type = 'text';
            iconeOlho.className = 'fa-solid fa-eye-slash';
        } else {
            campoSenha.type = 'password';
            iconeOlho.className = 'fa-solid fa-eye';
        }
    });
}
