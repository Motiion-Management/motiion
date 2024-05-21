import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
export function PreviewTabs() {
  return (
    <Tabs defaultValue="account" className="mt-[175%]">
      <TabsList className="grid w-full grid-cols-3 rounded-full">
        <TabsTrigger className="rounded-full" value="account">
          About
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="password">
          Resume
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="links">
          Links
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="border-none">
        <Accordion type="single" collapsible>
          <Card>
            <AccordionItem value="attributes" title="attributes">
              <AccordionTrigger>Attributes</AccordionTrigger>
              <AccordionContent>
                <CardHeader></CardHeader>
                <CardContent>
                  <CardDescription>
                    <div>
                      Ethnicity
                      <p>White</p>
                    </div>
                    <div>
                      Height
                      <p>5'9</p>
                    </div>
                    <div>
                      Ethnicity
                      <p>White</p>
                    </div>
                    <div>
                      Ethnicity
                      <p>White</p>
                    </div>
                    <div>
                      Ethnicity
                      <p>White</p>
                    </div>
                  </CardDescription>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
          <AccordionItem value="Representation" title="Representation">
            <AccordionTrigger>Representation</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Representation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <div>
                      <p>Bloc Talent Agency</p>
                    </div>
                  </CardDescription>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="Sizing" title="Sizing">
            <AccordionTrigger>Sizing</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Sizing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <div>
                      <p>Bloc Talent Agency</p>
                    </div>
                  </CardDescription>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  )
}
