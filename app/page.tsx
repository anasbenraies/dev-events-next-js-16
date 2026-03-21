import ExploreBtn from "@/components/ExploreBtn"
import EventCard from "@/components/EventCard"
import { time } from "console"
// const events = [
//   {
//     image: "/images/event1.png",
//     title: "Tech Conference 2024",
//     slug: "tech-conference-2024",
//     date: "2024-06-01",
//     location: "New York, USA",
//     description: "Join us for the Tech Conference 2024, where we'll explore the latest trends and innovations in the tech industry.",
//     time: "10:00 AM - 5:00 PM"

//   },
//   {
//     image: "/images/event2.png",
//     title: "Web Development Workshop",
//     slug: "web-development-workshop",
//     date: "2024-06-15",
//     location: "San Francisco, USA",
//     description: "Learn the fundamentals of web development with our hands-on workshop.",
//     time: "9:00 AM - 4:00 PM"
//   },

// ]

import { events } from "@/lib/constants"

const page = () => {
  return (
    <section>
      <h1 className="text-center">The Hub for every Event</h1>
      <p className="text-center mt-5">Discover and connect with events that matter to you.</p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {/* event has { image , title , slug, date, location, time }*/}
          {events.map((event, index) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>

          ))}
        </ul>
      </div>
    </section>
  )
}

export default page