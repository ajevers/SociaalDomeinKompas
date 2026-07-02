import './globals.css';

export const metadata = {
  title: 'Sociaal Domein Kompas MVP',
  description: 'Elementaire versie van het Sociaal Domein Kompas'
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
