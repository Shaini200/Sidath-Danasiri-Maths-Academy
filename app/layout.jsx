import '../src/index.css';

export const metadata = {
  title: 'Sidath Danasiri Maths Academy',
  description: 'Student and payment management portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
