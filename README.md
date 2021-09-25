# Weather

A weather app. Shows the following data pulled from the OpenWeatherMap API: 
* Temperature averages
* FeelsLike temperature
* Cloud cover
* UV index
* Wind (speed, direction, and wind gusts)
* Pressure
* Humidity and dew point
* Visibility
* Weather categories (overcast, rain, extreme weather, etc.)
* Rain
* Snow
* Sunrise / Sunset and hours/percentage of day/night

The location can be auto-detected or manually entered. Locations retrieved from the LocationIQ API are used in the autocomplete field.

## Structure
This is the Basic JavaScript version of the Weather app. It uses JavaScript modules. The app is separated into the following modules:
* App - the main app runner
* Events - event handler and state manager
* Weather - Functions related to the display of the app and rendering of the cards, as well as retrieving weather data from the API
* WeatherFunctions - Functions for handling different numerical quantities supplied by the weather API
* WeatherLocation - Functions related to retrieving user location and passing it to the weather app
* utility - Utility functions

I will be writing a version in React soon, which will have more features, such as saved places and a multi-day forecast.

## v0.1
Major code refactoring.
* Both JSON requests are fulfilled by a Promise.all()
* C/F conversion is centrally handled
* Weather functions are clearly separated
* Event manager

Implemented:
* User-specified location
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
* Manually user-supplied location - done
* Remember user's choice about sharing location (old version just requested it regardless) - done
* Automatically updating location if user requests
* Multi-day forecast (maybe in React version?)
* Saved cities / places / addresses (maybe in React version?)

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