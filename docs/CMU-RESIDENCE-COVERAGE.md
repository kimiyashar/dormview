# CMU residence coverage

Status: production deployment verified at https://dormview.vercel.app on 2026-10-31.

CMU's current housing index separates 14 residence halls from 12 apartment properties. DormView's current local catalog covers 13 residence halls and 32 room types.

## Fully furnished representative rooms

- Morewood Gardens E-Tower
- Morewood Gardens Main
- Mudge House
- Donner House
- Stever House
- Boss House
- Hamerschlag House
- Scobell House

These entries use the representative CMU room-plan dimensions and source-driven furniture placements.

## Verified shells

- Henderson House: semi-suite single and double. CMU's printed dimensions bound the complete unit envelope, not the clear bedroom. DormView preserves that limitation in `modelStatus` and `dimensionSpan` and does not invent furniture coordinates or internal bath geometry.
- McGill House: semi-suite single and double. The published dimensions cover the complete illustrated unit, including bath and entry geometry. The double's 24-foot dimension is not presented as a 24-foot bedroom.
- Resnik House: semi-suite single and double bedroom shells. Complete 3-, 4-, and 5-person suite topology varies by room number.
- Welch House: semi-suite single and double bedroom shells. Shared-bath topology is not included without printed internal dimensions.
- West Wing: semi-suite single and double bedroom shells. Complete suite topology varies by room number.

A verified shell is intentionally empty. Students can place inventory items, but the app does not imply that an invented default arrangement came from CMU.

## Blocked from generic implementation

Fifth & Clyde is the remaining residence hall. CMU publishes six full-floor PDFs and many room-number-specific tours, but no generic exact room-type PDFs. It has semi-suite single, semi-suite double, suite single, and suite double variants with materially different unit topology. It must be implemented as numbered room variants traced from official floor sheets, not as one fabricated generic room.

## Scope boundary

Residence on Fifth is officially listed as an apartment, not a residence hall. It belongs in a later apartment phase alongside Clyde House, Fairfax, Fifth Neville, Forbes Beeler, The Highlands, Maggie Mo First-Year Houses, Margaret Morrison, Neville, Roselawn Houses, Spirit House, and Woodlawn.

## Official sources

- Residence index: https://www.cmu.edu/housing/our-communities/residences/index.html
- Henderson: https://www.cmu.edu/housing/our-communities/residences/henderson.html
- McGill: https://www.cmu.edu/housing/our-communities/residences/mcgill.html
- Resnik: https://www.cmu.edu/housing/our-communities/residences/resnik.html
- Welch: https://www.cmu.edu/housing/our-communities/residences/welch.html
- West Wing: https://www.cmu.edu/housing/our-communities/residences/west-wing.html
- Fifth & Clyde: https://www.cmu.edu/housing/our-communities/residences/fifth-clyde/index.html

CMU states that room plans are representative, dimensions are estimates, and actual room sizes, furniture, and configurations may vary.


## Production verification

- `accuracytest.js`: passed all catalog, source, finish, and renderer assertions.
- `roomcheck.js`: passed all 32 rooms with no remaining allowlisted bounds or furniture-overlap exceptions.
- Browser matrix: all 32 picker entries opened with the expected room title and a nonzero canvas.
- Layout regression: Standard, Beds raised, Bunked, and Open middle executed; autosave restored the selected Mudge room and layout after reload.
- Production bytes matched the committed local HTML by SHA-256 after deployment.
- Vercel reported the production deployment Ready and the public alias returned HTTP 200.
