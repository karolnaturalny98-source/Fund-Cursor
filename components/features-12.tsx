'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ChartBarIncreasingIcon, Database, Fingerprint, IdCard } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = {
        'item-1': {
            image: '/s1.png',
            alt: 'Porównania cashbacku',
        },
        'item-2': {
            image: '/s2.png',
            alt: 'Zaufane opinie traderów',
        },
        'item-3': {
            image: '/s3.png',
            alt: 'Panel analityczny FundedRank',
        },
        'item-4': {
            image: '/s4.png',
            alt: 'Zautomatyzowane alerty payoutów',
        },
    }

    return (
        <section className="relative isolate overflow-hidden py-12 md:py-20 lg:py-32">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.5),transparent_55%)]" />
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">Dlaczego FundedRank?</p>
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Zaufany partner w wyborze prop firmy</h2>
                    <p>Łączymy weryfikacje regulaminów, opinie traderów i aktualne cashbacki, abyś podejmował decyzje na twardych danych – w jednym UX-ie.</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Database className="size-4" />
                                    Zweryfikowane dane
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Stałe monitorowanie regulaminów, payoutów i aktualnych kodów – każda zmiana trafia do rankingu w ciągu godzin, nie dni.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Fingerprint className="size-4" />
                                    Opinie traderów
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Tylko potwierdzone recenzje i transparentne metryki – możesz zgłosić nieścisłości i dostać update w panelu.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <IdCard className="size-4" />
                                    Cashback i alerty
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Negocjujemy prowizje bezpośrednio z partnerami i powiadamiamy, gdy pojawi się kod z lepszym procentem.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <ChartBarIncreasingIcon className="size-4" />
                                    Narzędzia analityczne
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Porównania, alerty, historia cen planów – wszystko, czego potrzebujesz zanim klikniesz „Kup konto”.</AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                                    <Image
                                        src={images[activeItem].image}
                                        className="size-full object-cover object-left-top dark:mix-blend-lighten"
                                        alt={images[activeItem].alt}
                                        width={1207}
                                        height={929}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
