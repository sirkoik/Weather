# Weather

## Structure
Weather uses two APIs: OpenWeatherMap and LocationIQ.

OpenWeatherMap is used to get weather-related information for a location, such as from Lat/Long coordinates provided by the user's device.

(note: this is not implemented yet) LocationIQ is used to get Lat/Long coordinates from a user-provided location or address. This way, they can get information even if they don't want to disclose their exact location (iOS has a way of setting a less exact location).

## v0.1
Major code refactoring.
* Both JSON requests are fulfilled by a Promise.all()
* C/F conversion is centrally handled
* Weather functions are clearly separated
* Event manager

Implemented:
* User-specified metric/imperial conversion
* Dew point
* Rain*
* Snow*
* Weather details (array from the weather property)
* Some card backgrounds change colors based on information
** Temperatures range from blue (cold) to red (hot).
** UV is colored based on the EPA's UV scale.
** Cloud cover is shaded based on cloud cover percentage.

*Untested, API is not the most clear on property name details.

Bugfixes:
* Wind speed is now in km/h instead of m/s
* Errors are now handled for failing to retrieve location data and JSON feeds.

Need to re-implement:
* Day / night theme

Will implement:
* Manually user-supplied location
* Remember user's choice about sharing location (old version just requested it regardless)


## v0.0.13
Some display tweaks.
Card layout is now the main one.

Bug - error if user declines automatic location.

## v0.0.12
Overhauled display
Added emojis to indicate intensity of units (i.e., a freeze emoji for cold weather, a cactus for very low humidity)
Improved readability somewhat (still needs work)
Temporarily disabled nighttime checking

## v0.0.11a
Corrected fonts to a fixed size.
Implemented some error checking (needs more work).

## v0.0.11
Added "Feels like" temperature.
Added wind gust (will show if data is available).

## v0.0.10
Added UV index (experimental).
Some code refactoring needed.

## v0.0.9
Added night hours / %
Now refreshes without reloading page (refreshes coordinates as well).

## v0.0.8
Fixed day/night cycle, improved graphics
Title bar now colored with temperature.

## v0.0.4
Added different units of pressure

## v0.0.3
Added geolocation
Added visibility

## v0.0.2a
Rewrite without jQuery.

## v0.0.1a
Uses OpenWeatherMap API to get weather information.