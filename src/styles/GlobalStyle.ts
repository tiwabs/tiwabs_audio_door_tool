import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`

  @font-face {
    font-family: 'BigJohn';
    src: local('BigJohn'), url(./font/BIG_JOHN.otf) format('opentype');
  }

  *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'BigJohn';
    font-size: 16px;
    color: #E1E1E6;
    overflow: hidden;
  }
`
