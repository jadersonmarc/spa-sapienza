import Image from "next/image"
import { Mail, MapPin, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-10 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <Image
              src="/logo-sapienza-footer.webp"
              alt="Sapienza Labs"
              width={168}
              height={92}
              className="mx-auto mb-3 h-auto w-36 md:mx-0 sm:w-40"
            />
            <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0">
              Product Studio de Inteligência Tecnológica
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm items-center md:items-start">
            <a 
              href="mailto:contato@sapienzalabs.com.br" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="break-all">jadersonmarc@sapienzalabs.com.br</span>
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              Rio de Janeiro, Brasil
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 md:justify-start">
            <a 
              href="https://www.linkedin.com/in/marc-jaderson-037183114/" 
              className="w-10 h-10 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="https://www.instagram.com/jadersonmarc/" 
              className="w-10 h-10 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 text-center sm:mt-10">
          <p className="font-mono text-muted-foreground text-xs">
            © {new Date().getFullYear()} Sapienza Labs. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
