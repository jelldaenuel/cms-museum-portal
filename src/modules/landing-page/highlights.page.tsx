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
