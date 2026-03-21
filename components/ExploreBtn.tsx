'use client'

import Image from 'next/image'

const ExploreBtn = () => {
    return (
        <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={() => alert("hey ")}>
            <a href="#events" >
                 Explore Events
                <Image src="/icons/arrow-down.svg" alt="arrow right" width={20} height={20} className="inline-block ml-2" />
            </a>
        </button>
    )
}

export default ExploreBtn