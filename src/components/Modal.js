const Modal = ({ isOpen, closeModalHandler, children }) => {
  return (
    <div
      class=" bg-red fixed top-0 right-0 bottom-0 left-0 flex justify-center items-center overflow-hidden z-101 transition duration-300"
      style={{
        bottom: isOpen ? '0vh' : '100vh',
        opacity: isOpen ? 100 : 0,
        background: isOpen ? '000000cc' : 'transparent',
      }}
    >
      <div class="flex flex-col items-center mr-3 mt-3 mb-3 ml-3 bg-sky-900 w-full max-w-sm max-w-screen-xl gap-8 rounded-lg border-2 border-[#ee145c] p-8 text-white shadow-2xl">
        {children}
      </div>
    </div>
  );
};

export default Modal;
