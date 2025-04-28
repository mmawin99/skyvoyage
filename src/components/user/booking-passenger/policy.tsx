"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";
type PolicyDialogsType = "foreign" | "purchase" | "refund" | null;
export default function PolicyDialogs({
    openDialog, 
    setOpenDialog 
}: { 
    openDialog: PolicyDialogsType 
    setOpenDialog: React.Dispatch<React.SetStateAction<PolicyDialogsType>>
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Airline Traveling Policy for Foreign Items */}
      <Dialog open={openDialog === "foreign"} onOpenChange={(open) => setOpenDialog(open ? "foreign" : null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Airline Traveling Policy for Foreign Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>To ensure the safety of all passengers, the following foreign and personal items are prohibited on board:</p>

            <div>
              <h4 className="font-semibold">1. Dangerous Goods</h4>
              <ul className="list-disc list-inside ml-4">
                <li>Explosives (fireworks, flares, detonators)</li>
                <li>Compressed gases (butane, propane, oxygen cylinders)</li>
                <li>Flammable liquids (paints, solvents, lighter fuel)</li>
                <li>Flammable solids (matches, lighters in bulk)</li>
                <li>Oxidizers and organic peroxides (bleach, pool chemicals)</li>
                <li>Toxic and infectious substances (insecticides, viruses)</li>
                <li>Corrosives (acids, wet cell batteries, mercury)</li>
                <li>Radioactive materials</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">2. Restricted Cultural Artifacts</h4>
              <ul className="list-disc list-inside ml-4">
                <li>National heritage artifacts without export permits</li>
                <li>Protected wildlife products (ivory, corals, skins)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">3. Weapons and Sharp Objects</h4>
              <ul className="list-disc list-inside ml-4">
                <li>Firearms and ammunition (without proper declaration)</li>
                <li>Knives, box cutters, razor blades</li>
                <li>Sporting bats, clubs, and martial arts equipment</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">4. Miscellaneous</h4>
              <ul className="list-disc list-inside ml-4">
                <li>Large quantities of cash (subject to customs rules)</li>
                <li>Counterfeit goods or illegal substances</li>
                <li>Strong magnets or devices interfering with aircraft electronics</li>
              </ul>
            </div>

            <p>Please always verify specific airline regulations, as rules can vary depending on the country of origin and destination.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Ticket Policy */}
      <Dialog open={openDialog === "purchase"} onOpenChange={(open) => setOpenDialog(open ? "purchase" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Ticket Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>All ticket purchases are subject to availability and pricing at the time of booking.</p>
            <p>Full payment is required to confirm the reservation.</p>
            <p>Tickets are non-transferable and must match the traveler&rsquo;s ID.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Policy */}
      <Dialog open={openDialog === "refund"} onOpenChange={(open) => setOpenDialog(open ? "refund" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Refund eligibility depends on the airline&rsquo;s fare rules and your selected ticket type.</p>
            <p>Processing fees may apply. Some promotional fares are non-refundable.</p>
            <p>Refund requests must be submitted before the departure date.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}