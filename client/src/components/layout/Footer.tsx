const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Netaji Subhash University. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
