# Sociaal Domein Kompas MVP — deel 4

Deze versie bevat:
- Thema kiezen
- Doel kiezen
- Interventie kiezen
- Gemeente kiezen via autocomplete
- OpenAI API-koppeling
- OpenAI web search tool
- Resultatenlijst met bronlinks

Vereist in Vercel:
`OPENAI_API_KEY`

Upload/vervang in GitHub:
- `app`
- `package.json`
- `README.md`

Vercel deployt daarna automatisch opnieuw.

## Belangrijk

Deze versie gebruikt OpenAI web search. Daardoor kan de app actuele openbare pagina's vinden, zoals gemeentelijke pagina's over budgetbeheer, schuldhulp, mantelzorg of welzijn.

De app blijft neutraal:
- geen score
- geen advies
- geen rangschikking
- geen verzonnen organisaties
- alleen resultaten met bronlinks
