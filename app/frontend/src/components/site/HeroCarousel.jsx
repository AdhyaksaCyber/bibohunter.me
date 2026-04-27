          <img
            src={slide.image}
            alt=\"\"
            className=\"absolute inset-0 w-full h-full object-cover\"
            style={{
              transform: idx === active ? \"scale(1.04)\" : \"scale(1)\",
              transition: \"transform 8s ease-out\",
            }}
          />
          <div className=\"absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30\" />
          <div className=\"absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50\" />
          <div className=\"relative h-full max-w-[1400px] mx-auto px-6 sm:px-10 flex items-center\">
