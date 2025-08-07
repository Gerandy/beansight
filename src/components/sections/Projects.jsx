import { RevealOnScroll } from "../RevealOnScroll";

function Projects(){
  return (
    <section
      id="projects"
      className="min-h-screen flex items-center justify-center py-20"
    >
      <RevealOnScroll>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent text-center">
            {" "}
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_2px_8px_rgba(192,132,252,0.3)] transition">
              <h3 className="text-xl font-bold mb-2"> POS System (Computer Hardware)</h3>
              <p className="text-gray-400 mb-4">
                A Point of Sale (POS) System specifically designed for a computer hardware store. It aims to streamline sales transactions, manage inventory efficiently, and generate real-time reports for better business decision-making. The system allows staff to record purchases, update stock levels, and track customer orders with ease.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Java"].map((tech, key) => (
                  <span
                    key={key}
                    className="bg-purple-500/10 text-purple-500 py-1 px-3 rounded-full text-sm hover:bg-purple-500/20 
                                    hover:shadow-[0_2px_8px_rgba(192,132,252,0.3)] transition-all
                    "
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <a
                  href="https://github.com/Gerandy/HCI.git"
                  className="text-purple-400 hover:text-purple-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>
            <div
              className="
              glass p-6 rounded-xl border border-white/10 
              hover:-translate-y-1 hover:border-purple-500/30
              hover:shadow-[0_4px_20px_rgba(192,132,252,0.3)]
              transition-all
            "
            >
              <h3 className="text-xl font-bold mb-2">Payroll System for a Trucking Company</h3>
              <p className="text-gray-400 mb-4">
                A Payroll System developed for a trucking company to manage employee salary processes efficiently. The system is designed to handle driver and staff payroll computations based on work hours, and deductions. It improves accurate and timely salary generation, and payslip issuance.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["PHP", "HTML", "CSS","BOOTSTRAP"].map((tech, key) => (
                  <span
                    key={key}
                    className="
                      bg-purple-500/10 text-purple-500 py-1 px-3 
                      rounded-full text-sm
                      transition
                      hover:bg-purple-500/20 hover:-translate-y-0.5
                      hover:shadow-[0_2px_8px_rgba(192,132,252,0.3)]
                    "
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <a
                  href="https://github.com/Gerandy/saad.git"
                  className="text-purple-400 hover:text-purple-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>

            <div
              className="
              glass p-6 rounded-xl border border-white/10 
              hover:-translate-y-1 hover:border-purple-500/30
              hover:shadow-[0_4px_20px_rgba(192,132,252,0.3)]
              transition-all
            "
            >
              <h3 className="text-xl font-bold mb-2">Swift Pay (Payroll System)</h3>
              <p className="text-gray-400 mb-4">
                A Payroll System designed to manage employee, distribute salaries and to calculate such deductions or taxes of the employee. The System also had an issuance of Payslip.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["HTML", "PHP", "CSS", "BOOTSTRAP"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="
                      bg-purple-500/10 text-purple-500 py-1 px-3 
                      rounded-full text-sm
                      transition
                      hover:bg-purple-400/20 hover:-translate-y-0.5
                      hover:shadow-[0_2px_8px_rgba(192,132,252,0.3)]
                    "
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
              <div className="flex justify-between items-center">
                <a
                  href="https://github.com/Gerandy/PHP-PROJECT.git"
                  className="text-purple-400 hover:text-purple-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>

            <div
              className="
              glass p-6 rounded-xl border border-white/10 
              hover:-translate-y-1 hover:border-purple-500/30
              hover:shadow-[0_4px_20px_rgba(192,132,252,0.3)]
              transition-all
            "
            >
              <h3 className="text-xl font-bold mb-2">AHJIN GUILD PORTFOLIO</h3>
              <p className="text-gray-400 mb-4">
                A portfolio designed by Ahjin Guild to showcase each of the members backgrounds and the project of the team.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["NodeJS","Tailwind CSS","HTML","JAVASCRIPT","CSS","ReactJS"].map((tech, key) => (
                  <span
                    key={key}
                    className="
                      bg-purple-500/10 text-purple-500 py-1 px-3 
                      rounded-full text-sm
                      transition
                      hover:bg-purple-500/20 hover:-translate-y-0.5
                      hover:shadow-[0_2px_8px_rgba(192,132,252,0.3)]
                    "
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center ">
                <a
                  href="https://github.com/Gerandy/ahjin.git"
                  className="text-purple-400 hover:text-purple-300 transition-colors my-4"
                >
                  View Project →
                </a>
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};
export default Projects