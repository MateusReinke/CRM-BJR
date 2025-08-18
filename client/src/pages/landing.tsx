import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  CheckCircle, 
  MessageCircle,
  ExternalLink,
  Users,
  Wrench,
  Shield,
  Award
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleWhatsApp = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da BJR Centro Automotivo", "_blank");
  };

  const handleChat = () => {
    // Simular chat online
    alert("Chat online será implementado em breve. Por favor, use o WhatsApp no momento.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="https://static.wixstatic.com/media/c97016_f40c4aa13f3045d580bd10f6983b15be~mv2.png/v1/fill/w_325,h_147,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image-removebg-preview%20-%202024-11-05T142157_349.png" 
                alt="BJR Centro Automotivo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">BJR Centro Automotivo</h1>
                <p className="text-sm text-muted-foreground">Excelência em serviços automotivos</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleChat}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat Online
              </Button>
              <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Link href="/auth">
                <Button variant="outline">
                  Acesso Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-foreground">
              Seu Centro Automotivo de Confiança
            </h2>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Com mais de 15 anos de experiência, oferecemos serviços automotivos de qualidade 
              com tecnologia avançada e atendimento personalizado em nossas 3 unidades.
            </p>
            <div className="flex justify-center gap-4 mb-12">
              <Button size="lg" onClick={handleWhatsApp} className="bg-red-600 hover:bg-red-700">
                <Phone className="mr-2 h-5 w-5" />
                Solicitar Orçamento
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}>
                Nossos Serviços
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                  <div className="text-2xl font-bold text-foreground">15+</div>
                  <div className="text-sm text-muted-foreground">Anos de Experiência</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-green-600" />
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <div className="text-sm text-muted-foreground">Unidades Ativas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                  <div className="text-2xl font-bold text-foreground">5000+</div>
                  <div className="text-sm text-muted-foreground">Clientes Atendidos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 mx-auto mb-4 text-yellow-600" />
                  <div className="text-2xl font-bold text-foreground">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfação</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 text-foreground">Nossos Serviços</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços automotivos com qualidade garantida
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wrench className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Manutenção Preventiva</CardTitle>
                <CardDescription>Revisões completas, troca de óleo, filtros e fluidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Troca de óleo e filtros
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Revisão do sistema elétrico
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Verificação de fluidos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Sistemas de Freios</CardTitle>
                <CardDescription>Manutenção e reparo de sistemas de frenagem</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Troca de pastilhas e discos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Sangria do sistema
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Reparo de cilindros
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Suspensão e Direção</CardTitle>
                <CardDescription>Alinhamento, balanceamento e reparos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Alinhamento 3D
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Balanceamento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Troca de amortecedores
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 text-foreground">Nossas Unidades</h3>
            <p className="text-xl text-muted-foreground">Escolha a unidade mais próxima de você</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* SP1 */}
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>São Paulo SP1</CardTitle>
                  <Badge className="bg-blue-600">Matriz</Badge>
                </div>
                <CardDescription>Nossa unidade principal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Av. Paulista, 1234 - Bela Vista, SP</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>(11) 3333-1111</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Seg-Sex: 07:00-18:00 | Sáb: 07:00-12:00</span>
                </div>
              </CardContent>
            </Card>

            {/* SP2 */}
            <Card className="border-l-4 border-l-black">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>São Paulo SP2</CardTitle>
                  <Badge variant="outline">Filial</Badge>
                </div>
                <CardDescription>Zona Sul de São Paulo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>R. Domingos de Morais, 5678 - Vila Mariana, SP</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>(11) 3333-2222</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Seg-Sex: 07:00-18:00 | Sáb: 07:00-12:00</span>
                </div>
              </CardContent>
            </Card>

            {/* SOR */}
            <Card className="border-l-4 border-l-green-600">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sorocaba SOR</CardTitle>
                  <Badge className="bg-green-600">Filial</Badge>
                </div>
                <CardDescription>Atendendo Sorocaba e região</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>Av. Ipanema, 9999 - Centro, Sorocaba</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>(15) 3333-3333</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Seg-Sex: 07:00-18:00 | Sáb: 07:00-12:00</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 text-foreground">Dúvidas Frequentes</h3>
            <p className="text-xl text-muted-foreground">Respostas para as perguntas mais comuns</p>
          </div>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qual o prazo para orçamento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nossos orçamentos são elaborados em até 24 horas úteis. Para serviços simples, 
                  conseguimos dar o valor na mesma hora.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vocês trabalham com seguro?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim, somos credenciados com as principais seguradoras do mercado. 
                  Entre em contato para verificar sua cobertura.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Oferecem garantia nos serviços?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos os nossos serviços têm garantia de 90 dias ou 3.000 km, 
                  o que ocorrer primeiro. Peças originais têm garantia do fabricante.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fazem agendamento online?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Entre em contato pelo WhatsApp ou ligue para nossa central. 
                  Também temos sistema online para nossos clientes cadastrados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h3 className="text-4xl font-bold mb-4">
              Pronto para cuidar do seu veículo?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Entre em contato agora e agende seu atendimento com nossa equipe especializada
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={handleWhatsApp}>
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp: (11) 99999-9999
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                <Mail className="mr-2 h-5 w-5" />
                contato@bjrautomotivo.com.br
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <img 
                src="https://static.wixstatic.com/media/c97016_f40c4aa13f3045d580bd10f6983b15be~mv2.png/v1/fill/w_325,h_147,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image-removebg-preview%20-%202024-11-05T142157_349.png" 
                alt="BJR Centro Automotivo"
                className="h-8 w-auto"
              />
              <div>
                <div className="font-semibold text-foreground">BJR Centro Automotivo</div>
                <div className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-99</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 BJR Centro Automotivo. Todos os direitos reservados.</span>
              <Separator orientation="vertical" className="h-4" />
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}