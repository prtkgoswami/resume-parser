type AccordionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

const Accordion = ({ title, isOpen, onToggle, children }: AccordionProps) => {
  return (
    <div className="mt-6">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-3 py-2 text-sm font-semibold bg-gray-50 hover:bg-gray-100 transition"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        role="region"
      >
        <div className="overflow-hidden px-3 py-2">{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
