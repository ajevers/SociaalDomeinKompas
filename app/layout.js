import './globals.css';

export const metadata = {
  title: 'Sociaal Domein Kompas',
  description: 'Keuzehulp sociaal domein'
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
