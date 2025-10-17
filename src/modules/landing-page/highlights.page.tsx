import { useState } from 'react';
import EventItem from "@/components/event-item";
import Eyebrow from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";

const Highlights = () => {
  const [isReviewsVisible, setIsReviewsVisible] = useState(false); // State para sa visibility ng reviews

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-12 lg:py-20 md:py-16 py-12 px-5">
        <div className="grid xl:grid-cols-12 grid-cols-1 xl:gap-8 gap-10 items-center">
          <div className="xl:col-span-6 lg:col-span-8 flex flex-col xl:gap-24 md:gap-20 gap-10">
            <div className="flex flex-col gap-6">
              <Eyebrow label="Museum Sneakpeak" />
              <h3 className="font-display md:text-display-xl text-display-md font-normal pb-4 text-[#492309]">
                Immerse Yourself in Rizal Province's Past
              </h3>
            </div>
            <EventItem 
              date="September 2, 2013" 
              key={"2"} 
              icon={"/highlight_1.jpeg"} 
              title={"THE BLANCO FAMILY ART MUSEUM"} 
              description={"The museum houses the vast collection of artwork produced by the Blanco family of painters."} 
            />
            <div className="xl:flex hidden items-start">
              <Button variant={"linkHover2"} className="text-[#0B0400] font-bold">
                Read more <span> <ArrowRightIcon className="ml-1" /> </span>
              </Button>{" "}
            </div>
          </div>
          <div className="xl:col-span-6 lg:col-span-8 flex flex-col xl:gap-24 md:gap-20 gap-10 xl:px-14">
            <EventItem 
              date="September 2, 2013" 
              key={"2"} 
              icon={"/highlight_2.jpeg"} 
              title={"THE BOTONG FRANCISCO MUSEUM AND STREET MURALS"} 
              description={"The Botong Francisco Museum & Street Murals is just 10 minutes away from Blanco Art Family Museum."} 
            />
            <EventItem 
              key={"2"} 
              date="September 2, 2013" 
              icon={"/highlight_3.jpeg"} 
              title={"NEMIRANDA ART HOUSE"} 
              description={"A collection of famous artist ( Nemesio “Nemi” R. Miranda Jr.) paintings masterfully employing figurative realism in his artworks, portraying rural life and folkloric art on display."} 
            />
          </div>
        </div>
        
        {/* Bagong button para sa Reviews and Ratings */}
        <div className="mt-6 flex items-center justify-center">
          <Button 
            onClick={() => setIsReviewsVisible(true)} // Toggle para ipakita ang container
            variant="default" // Pwede mong baguhin ang variant kung gusto mo
            className="text-[#0B0400] font-bold"
          >
            Review and Ratings
          </Button>
        </div>

        {/* Container para sa reviews, ipapakita lang kapag isReviewsVisible ay true */}
        {isReviewsVisible && (
          <div className="mt-4 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
            <h4 className="text-lg font-bold mb-4">Reviews and Ratings</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Great museum! The exhibits are very informative. Rating: 5 stars. - User1</li>
              <li>Fun and educational visit. Worth the trip! Rating: 4 stars. - User2</li>
              <li>Amazing collection, but a bit crowded. Rating: 4.5 stars. - User3</li>
              {/* Dito mo pwede idagdag ang aktwal na reviews mula sa database o API */}
            </ul>
            <Button 
              onClick={() => setIsReviewsVisible(false)} // Toggle para itago ang container
              variant="secondary" 
              className="mt-4"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Highlights;
