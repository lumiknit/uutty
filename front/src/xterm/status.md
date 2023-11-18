# Output Sequences

## C0

-   [ ] NUL (`\0`, `\x00`)
-   [ ] BEL (`\a`, `\x07`)
-   [ ] BS (`\b`, `\x08`)
-   [ ] HT (`\t`, `\x09`)
-   [ ] LF (`\n`, `\x0A`)
-   [ ] VT (`\v`, `\x0B`)
-   [ ] FF (`\f`, `\x0C`)
-   [ ] CR (`\r`, `\x0D`)
-   [ ] SO (`\x0E`)
-   [ ] SI (`\x0F`)
-   [ ] ESC (`\e`, `\x1B`)

## C1

-   [ ] IND (`\x84`)
-   [ ] NEL (`\x85`)
-   [ ] HTS (`\x88`)
-   [ ] RI (`\x8D`)
-   [ ] SS2 (`\x8E`)
-   [ ] SS3 (`\x8F`)
-   [ ] DCS (`\x90`)
-   [ ] SPA (`\x96`)
-   [ ] EPA (`\x97`)
-   [ ] SOS (`\x98`)
-   [ ] DECID (`\x9A`)
-   [ ] CSI (`\x9B`)
-   [ ] ST (`\x9C`)
-   [ ] OSC (`\x9D`)
-   [ ] PM (`\x9E`)
-   [ ] APC (`\x9F`)

## APC (Application Program-Control Functions)

APC are ignored

-   [ ] Ignored (APC P t ST)

## CSI (Control Sequence Introducer)

-   [ ] ICH Insert Black Character (CSI P n @)
-   [ ] CUU Cursor Up (CSI P n A)
-   [ ] CUD Cursor Down (CSI P n B)
-   [ ] CUF Cursor Forward (CSI P n C)
-   [ ] CUB Cursor Backward (CSI P n D)
-   [ ] CNL Cursor Next Line (CSI P n E)
-   [ ] CPL Cursor Previous Line (CSI P n F)
-   [ ] CHA Cursor Character Absolute (CSI P n G)
-   [ ] CUP Cursor Position (CSI P l ; P l H)
-   [ ] CHT Cursor Forward Tabulation (CSI P n I)
-   [ ] ED Erase in Display (CSI P n J)
    -   [ ] DECSED Erase in display (CSI ? P s J)
-   [ ] EL Erase in Line (CSI P n K)
    -   [ ] DECSEL Erase in Line (CSI ? P s K)
-   [ ] IL Insert Lines (CSI P n L)
-   [ ] DL Delete Lines (CSI P n M)
-   [ ] DCH Delete Character (CSI P n P)
-   [ ] SU Scroll Up (CSI P n S)
-   [ ] SD Scroll Down (CSI P n T)
-   [ ] Initiate highlight mouse tracking (CSI P s ; P s ; P s ; P s ; P s T)
-   [ ] ECH Erase Character (CSI P n X)
-   [ ] CBT Cursor Backward Tabulation (CSI P n Z)
-   [ ] HPA Character Position Absolute (CSI P n `)
-   [ ] REP Repeat (CSI P s b)
-   [ ] DA Device Attributes (CSI c)
    -   [ ] Send Device Attributes (CSI > P s c)
-   [ ] VPA Line Position Absolute (CSI P n d)
-   [ ] HVP Horizontal and Vertical Position (CSI P l ; P l f)
-   [ ] TBC Tabulation Clear (CSI P s g)
-   [ ] SM Set Mode (CSI P s h)
    -   [ ] DECSET Set Mode (CSI ? P s h)
-   [ ] MC Media Copy (CSI P s i)
    -   [ ] DECSMC Media Copy (CSI ? P s i)
-   [ ] RM Reset Mode (CSI P s l)
    -   [ ] DECRST Reset Mode (CSI ? P s l)
-   [ ] SGR Select Graphic Rendition (CSI P s m)
-   [ ] DSR Device Status Report (CSI P s n)
    -   [ ] Request Status String (CSI 0 n)
    -   [ ] Report Cursor Position (CSI 6 n)
-   [ ] DECSTR Soft Terminal Reset (CSI ! p)
-   [ ] DECSCL Select Conformance Level (CSI Ps ; Ps " p)
-   [ ] DECSCA Select character protection attribute (CSI Ps SP q)
-   [ ] DECSTBM Set scrolling region [top;bottom] (CSI P t ; P t r)
    -   [ ] Restore DEC Private Mode Values (CSI ? P s r)
-   [ ] DECCARA Change Attributes in Rectangular Area (CSI Pt; Pl; Pb; Pr; Ps $ r)
-   [ ] Save cursor (CSI s)
    -   [ ] Save DEC Private Mode Values (CSI ? P s s)
-   [ ] Window manipulation (CSI P t ; P t ; P t t)
-   [ ] DECRARA Reverse Attributes in Rectangular Area (CSI Pt; Pl; Pb; Pr; Ps $ t)
-   [ ] Save cursor (CSI u)
-   [ ] DECCRA Copy Rectangular Area (CSI Pt; Pl; Pb; Pr; Pp; Pt; Pl; Pp $ v)
-   [ ] DECFRA Fill Rectangular Area (CSI Pt; Pl; Pb; Pr; Ps $ w)
-   [ ] DECSACE Select Attribute Change Extent (CSI Ps $ x)
    -   [ ] DECFRA Fill Rectangular Area (CSI Pt; Pl; Pb; Pr; Ps $ x)
-   [ ] DECELA Enable Locator Reporting (CSI Ps ; P u' z)
-   [ ] DECEFR Enable Filter Rectangle (CSI Pt; Pl; Pb; Pr; Ps $ z)
-   [ ] DECSLE Select Locator Events (CSI Ps $ {)
-   [ ] DECSERA Selective Erase Rectangular Area (CSI Pt; Pl; Pb; Pr; Ps $ {)
-   [ ] DECRQLP Request Locator Position (CSI Ps $ |)

## DCS (Device-Control Functions)

-   [ ] DECUDK User-Define Keys (DCS P t ; P s | P t ST)
-   [ ] DECRQSS Request Status String (DCS P t ; P t ST)
-   [ ] Request Termcap/Terminfo String (DCS P t ; P t ST)

## ESC

-   [ ] IND (ESC D)
-   [ ] NEL (ESC E)
-   [ ] CUrsor to lower left corner of screen (if enabled by hpLowerLeftButCompat) (ESC F)
-   [ ] HTS (ESC H)
-   [ ] RI (ESC M)
-   [ ] DECID (ESC Z)
-   [ ] RIS (ESC c)
-   [ ] Locks memory above the cursor (ESC l)
-   [ ] Unlock memory (ESC m)
-   [ ] DECSC Save cursor (ESC 7)
-   [ ] DECRC Restore cursor (ESC 8)
-   [ ] DECPAM Application Keypad (ESC =)
-   [ ] DECPNM Normal Keypad (ESC >)

### DEC

-   [ ] controls/conformance (`ESC SP [FGLMN]`)
-   [ ] DEC single/double width (`ESC # [34568]`)
-   [ ] Character set (`ESC % [@G]`)
-   [ ] Designate Charset (`ESC [()*+] .`)

## OSC

e.g. `ESC ] 0; title BEL`

-   [ ] Set Icon Name and Window Title (`ESC ] 0; ... BEL`)
-   [ ] Set Window Title (`ESC ] 2; ... BEL`)
-   [ ] Set Color Number (`ESC ] 4; ... BEL`)
-   [ ] Set Foreground Color (`ESC ] 10; ... BEL`)
-   [ ] Set Background Color (`ESC ] 11; ... BEL`)
-   [ ] Set Cursor Color (`ESC ] 12; ... BEL`)
-   [ ] Set Mouse Foreground Color (`ESC ] 13; ... BEL`)
-   [ ] Set Mouse Background Color (`ESC ] 14; ... BEL`)
-   [ ] Set Tektronix Foreground Color (`ESC ] 15; ... BEL`)
-   [ ] Set Tektronix Background Color (`ESC ] 16; ... BEL`)
-   [ ] Set Highlight Color (`ESC ] 17; ... BEL`)
-   [ ] Set Tektronix Cursor Color (`ESC ] 18; ... BEL`)
-   [ ] Change Log File (Compile time option) (`ESC ] 46; ... BEL`)
-   [ ] Set font (`ESC ] 50; ... BEL`)
-   [ ] ~~Emacs Reserved (`ESC ] 51; ... BEL`)~~
-   [ ] Manipulate Selection Data (`ESC ] 52; ... BEL`)

-   [ ] Reset color name (`ESC ] 104; ... BEL`)
-   [ ] Reset foreground color (`ESC ] 110; ... BEL`)
-   [ ] Reset background color (`ESC ] 111; ... BEL`)
-   [ ] Reset cursor color (`ESC ] 112; ... BEL`)

# Input Sequence