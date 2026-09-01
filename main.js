/* ═══════════════════════════════════════════════════════════════
   ODONTOCLINIC LONDRINA — main.js
   Sete funções, nada além disso:
     1. IntersectionObserver do filete de assinatura e dos [data-reveal]
     2. Menu mobile (abrir/fechar com transição, Esc, clique fora, foco preso)
     3. Encolhimento do cabeçalho no scroll
     4. Validação + envio assíncrono do formulário
     5. Ano do rodapé
     6. Expandir citações extras no mobile
     7. Abertura e fechamento suaves do FAQ (Web Animations API)
   Sem bibliotecas. Sem CDN.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Assinaturas e reveals ─────────────────────────────── */
  (function observar() {
    var assinaturas = document.querySelectorAll('[data-sign]');
    var reveals = document.querySelectorAll('[data-reveal]');

    if (semMovimento || !('IntersectionObserver' in window)) {
      assinaturas.forEach(function (el) { el.classList.add('is-assinado'); });
      reveals.forEach(function (el) { el.classList.add('is-visivel'); });
      return;
    }

    var obsAssin = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        // `top < 0` cobre o caso de a rolagem passar tão rápido pelo bloco
        // que ele nunca é amostrado dentro da tela — o filete não pode
        // ficar invisível para sempre.
        var jaPassou = e.boundingClientRect.top < 0;
        if (!e.isIntersecting && !jaPassou) return;
        e.target.classList.add('is-assinado');   // dispara uma vez só
        obsAssin.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    assinaturas.forEach(function (el) { obsAssin.observe(el); });

    var obsReveal = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top >= 0) return;
        e.target.classList.add('is-visivel');
        obsReveal.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { obsReveal.observe(el); });
  })();

  /* ── 2. Menu mobile ───────────────────────────────────────── */
  (function menu() {
    var botao = document.getElementById('hamb');
    var painel = document.getElementById('painel');
    var fechar = document.getElementById('painel-fechar');
    if (!botao || !painel || !fechar) return;

    var focaveis = 'a[href], button:not([disabled])';
    var ultimoFoco = null;

    var fechando = null;

    function abrir() {
      if (fechando) { clearTimeout(fechando); fechando = null; }
      ultimoFoco = document.activeElement;
      painel.hidden = false;
      // reflow síncrono para o navegador registrar o estado inicial da transição
      void painel.offsetHeight;
      painel.classList.add('is-aberto');
      botao.setAttribute('aria-expanded', 'true');
      document.body.style.setProperty('overflow', 'hidden');
      fechar.focus();
      document.addEventListener('keydown', tecla, true);
      document.addEventListener('pointerdown', foraDoPainel, true);
    }

    function encerrar() {
      painel.classList.remove('is-aberto');
      botao.setAttribute('aria-expanded', 'false');
      document.body.style.removeProperty('overflow');
      document.removeEventListener('keydown', tecla, true);
      document.removeEventListener('pointerdown', foraDoPainel, true);
      if (ultimoFoco) ultimoFoco.focus();
      // esconde após a transição (fallback por tempo cobre reduced-motion)
      fechando = window.setTimeout(function () {
        painel.hidden = true;
        fechando = null;
      }, semMovimento ? 0 : 260);
    }

    function tecla(ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); encerrar(); return; }
      if (ev.key !== 'Tab') return;
      var lista = painel.querySelectorAll(focaveis);
      if (!lista.length) return;
      var primeiro = lista[0];
      var ultimo = lista[lista.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) {
        ev.preventDefault(); ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault(); primeiro.focus();
      }
    }

    function foraDoPainel(ev) {
      if (!painel.contains(ev.target) && ev.target !== botao) encerrar();
    }

    botao.addEventListener('click', abrir);
    fechar.addEventListener('click', encerrar);
    painel.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', encerrar);
    });
  })();

  /* ── 3. Cabeçalho encolhe no scroll ───────────────────────── */
  (function cabecalho() {
    var cab = document.getElementById('cab');
    if (!cab) return;
    var agendado = false;

    function medir() {
      cab.classList.toggle('is-encolhido', window.scrollY > 80);
      agendado = false;
    }
    window.addEventListener('scroll', function () {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(medir);
    }, { passive: true });
    medir();
  })();

  /* ── 4. Formulário ────────────────────────────────────────── */
  (function formulario() {
    var form = document.getElementById('form');
    if (!form) return;

    var status = document.getElementById('status');
    var botao = document.getElementById('enviar');
    var whatsFalha = 'https://wa.me/5543999189768?text=Ol%C3%A1!%20Tentei%20enviar%20o%20formul%C3%A1rio%20do%20site%20e%20n%C3%A3o%20consegui.%20Gostaria%20de%20falar%20com%20voc%C3%AAs.';

    var campos = [
      { el: document.getElementById('nome'),     erro: document.getElementById('erro-nome') },
      { el: document.getElementById('telefone'), erro: document.getElementById('erro-telefone') },
      { el: document.getElementById('mensagem'), erro: document.getElementById('erro-mensagem') },
      { el: document.getElementById('consent'),  erro: document.getElementById('erro-consent') }
    ];

    function marcar(campo, invalido, texto) {
      campo.el.setAttribute('aria-invalid', invalido ? 'true' : 'false');
      campo.erro.hidden = !invalido;
      if (invalido && texto) campo.erro.textContent = texto;
    }

    function digitos(v) { return (v || '').replace(/\D/g, ''); }

    function validar() {
      var primeiroInvalido = null;

      var nome = campos[0];
      var nomeVazio = nome.el.value.trim() === '';
      marcar(nome, nomeVazio, 'Escreva seu nome, por favor.');
      if (nomeVazio && !primeiroInvalido) primeiroInvalido = nome.el;

      var tel = campos[1];
      var telDig = digitos(tel.el.value);
      if (telDig.length === 0) {
        marcar(tel, true, 'Informe um telefone com DDD para que nossa equipe possa retornar.');
        if (!primeiroInvalido) primeiroInvalido = tel.el;
      } else if (telDig.length < 10 || telDig.length > 11) {
        marcar(tel, true, 'Confira o número — parece que faltou um dígito.');
        if (!primeiroInvalido) primeiroInvalido = tel.el;
      } else {
        marcar(tel, false);
      }

      var msg = campos[2];
      var msgVazia = msg.el.value.trim() === '';
      marcar(msg, msgVazia, 'Conte brevemente como podemos ajudar.');
      if (msgVazia && !primeiroInvalido) primeiroInvalido = msg.el;

      var ok = campos[3];
      var semConsent = !ok.el.checked;
      marcar(ok, semConsent, 'Precisamos da sua autorização para poder te ligar.');
      if (semConsent && !primeiroInvalido) primeiroInvalido = ok.el;

      return primeiroInvalido;
    }

    campos.forEach(function (campo) {
      if (!campo.el) return;
      campo.el.addEventListener('input', function () {
        if (campo.el.getAttribute('aria-invalid') === 'true') validar();
      });
      campo.el.addEventListener('change', function () {
        if (campo.el.getAttribute('aria-invalid') === 'true') validar();
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      status.textContent = '';

      var invalido = validar();
      if (invalido) { invalido.focus(); return; }

      botao.disabled = true;
      botao.textContent = 'Enviando…';

      fetch(form.action, { method: 'POST', body: new FormData(form) })
        .then(function (r) {
          if (!r.ok) throw new Error('resposta ' + r.status);
          form.reset();
          campos.forEach(function (c) { marcar(c, false); });
          status.textContent = '';
          var p = document.createElement('p');
          p.textContent = 'Mensagem recebida. Nossa equipe entrará em contato no próximo horário de atendimento — de segunda a sexta das 9h às 19h e aos sábados das 8h às 12h.';
          status.appendChild(p);
        })
        .catch(function () {
          status.textContent = '';
          var p = document.createElement('p');
          p.textContent = 'Não foi possível enviar o formulário neste momento. Se preferir, fale diretamente conosco pelo WhatsApp.';
          var a = document.createElement('a');
          a.className = 'btn btn--contorno';
          a.href = whatsFalha;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = 'Abrir WhatsApp';
          status.appendChild(p);
          status.appendChild(a);
        })
        .then(function () {
          botao.disabled = false;
          botao.textContent = 'Enviar';
        });
    });
  })();

  /* ── 5. Ano do rodapé ─────────────────────────────────────── */
  /* Gerado por JS para que o rodapé nunca congele num ano velho,
     como o "2022 ©" do site atual. */
  (function ano() {
    var el = document.getElementById('ano');
    if (el) el.textContent = new Date().getFullYear();
  })();

  /* ── 6. Ver mais citações (mobile) ────────────────────────── */
  (function maisCitacoes() {
    var botao = document.getElementById('ver-mais');
    var parede = document.getElementById('parede');
    if (!botao || !parede) return;
    botao.addEventListener('click', function () {
      parede.classList.add('is-aberta');
      botao.hidden = true;
    });
  })();

  /* ── 7. FAQ com abertura e fechamento suaves ──────────────── */
  /* <details> alterna o estado nativo de forma imediata; aqui a
     altura real da resposta é medida e animada com a Web Animations
     API. Enter/Space no <summary> disparam "click", então teclado e
     mouse passam pelo mesmo caminho. Com prefers-reduced-motion ou
     sem suporte a .animate(), o comportamento nativo é preservado. */
  (function faqSuave() {
    var itens = document.querySelectorAll('.faq .qa');
    if (!itens.length) return;
    if (semMovimento || !('animate' in Element.prototype)) return;

    var DUR_ABRE = 300;
    var DUR_FECHA = 240;
    var EASE = 'cubic-bezier(.22,.61,.36,1)';

    itens.forEach(function (qa) {
      var resumo = qa.querySelector('summary');
      var resposta = qa.querySelector('.qa__r');
      if (!resumo || !resposta) return;

      var animando = false;

      resumo.addEventListener('click', function (ev) {
        ev.preventDefault();               // assume o controle da alternância
        if (animando) return;              // ignora cliques durante a animação
        if (qa.open) fecharSuave(); else abrirSuave();
      });

      function abrirSuave() {
        animando = true;
        qa.open = true;                    // agora o navegador conhece a altura final
        var altura = resposta.scrollHeight;
        resposta.style.overflow = 'hidden';
        var anim = resposta.animate(
          [
            { height: '0px', opacity: 0, transform: 'translateY(-4px)' },
            { height: altura + 'px', opacity: 1, transform: 'none' }
          ],
          { duration: DUR_ABRE, easing: EASE }
        );
        anim.onfinish = anim.oncancel = function () {
          resposta.style.overflow = '';
          animando = false;
        };
      }

      function fecharSuave() {
        animando = true;
        var altura = resposta.scrollHeight;
        resposta.style.overflow = 'hidden';
        var anim = resposta.animate(
          [
            { height: altura + 'px', opacity: 1 },
            { height: '0px', opacity: 0 }
          ],
          { duration: DUR_FECHA, easing: EASE }
        );
        anim.onfinish = anim.oncancel = function () {
          resposta.style.overflow = '';
          qa.open = false;                 // só conclui o estado após a animação
          animando = false;
        };
      }
    });
  })();

})();
