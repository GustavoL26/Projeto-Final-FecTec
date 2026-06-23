function cadastrarProfessores(e) {
    if (e) e.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const disciplina = document.getElementById('disciplina').value;
    const senha = document.getElementById('senha').value;

    const regex_nome = /^(?=.*[A-Z])[a-zA-ZÀ-ÿ\s]+$/;

    if (nome === '' || disciplina === '' || senha === ''){
        alert('Preencha todos os campos.');
        return;
    } else if (!regex_nome.test(nome)){
        alert('O nome deve conter apenas letras e ter, obrigatoriamente, pelo menos uma letra MAIÚSCULA.');
        return;
    } else if (nome.trim().length < 3){
        alert('O nome deve ter, no mínimo, 3 letras.');
        return;
    }

    const senhaEspecial = 'p2R0f2Ss6R';

    if (senha !== senhaEspecial){
        alert('Senha institucional incorreta.');
        return;
    }

    const dadosFormulario = { nome, disciplina, senha };
    console.log('Front-end: Tentando enviar os dados para o servidor...', dadosFormulario);

    fetch('http://localhost:3000/cadastrar_professores', {
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
        if (status === 201){
            localStorage.setItem('tipoUsuario', dados.tipo_usuario);
            localStorage.setItem('nomeUsuario', dados.nome);
            localStorage.setItem('usuario_id', dados.usuario_id);

            alert('Cadastro realizado com sucesso!');
            window.location.href = 'principal.html';
        } else if (status === 409){
            alert('Este professor já está cadastrado.');
        } else{
            console.log(dados);
            alert(`Erro ${status}: ${dados.mensagem || 'Erro desconhecido'}`);
        }
    })
    .catch(erro => {
        console.error(erro);

        alert('Não foi possível conectar ao servidor.');
    });
}

const formulario = document.getElementById('cadastro');

if (formulario) {
    formulario.addEventListener('submit', cadastrarProfessores);
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
