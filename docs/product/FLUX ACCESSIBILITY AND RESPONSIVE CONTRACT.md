# FLUX — ACCESSIBILITY AND RESPONSIVE CONTRACT

## Objetivo

A interface do FLUX deve ser utilizável por teclado, leitores de tela e diferentes tamanhos de tela desde a primeira versão.

## Responsividade

```text
Desktop
Laptop
Tablet
Mobile
```

Não criar simplesmente uma versão desktop comprimida.

Cada layout deve definir:

- navegação
- hierarquia de conteúdo
- densidade de cards
- comportamento do player
- menus e ações prioritárias

## Acessibilidade

Requisitos mínimos:

- HTML semântico
- foco visível
- navegação completa por teclado
- labels para controles
- estados de erro compreensíveis
- contraste adequado
- alternativas textuais para conteúdo relevante
- respeito a `prefers-reduced-motion`
- tamanho de áreas interativas adequado

## Navegação

A ordem de foco deve acompanhar a ordem visual e lógica do conteúdo.

Menus e modais devem permitir entrada, navegação e saída sem prender o usuário em estado inconsistente.

## Mídia

Player deve prever:

```text
play/pause
volume
progress
fullscreen quando suportado
captions quando disponíveis
```

Shorts e autoplay nunca devem depender exclusivamente de movimento rápido ou áudio para comunicar informação.

## Estados da interface

Todo componente relevante deve possuir estados:

```text
default
loading
empty
error
disabled
success
```

## Tema

Suportar:

```text
Light
Dark
System
```

A identidade principal pode favorecer Dark, mas conteúdo e controles não podem depender de uma única condição visual.

## Regra

Acessibilidade e responsividade fazem parte do contrato funcional, não são uma etapa posterior de acabamento.
