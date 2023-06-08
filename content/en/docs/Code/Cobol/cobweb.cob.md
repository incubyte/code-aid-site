+++
categories = ["Documentation"]
title = "cobweb.cob"
weight = 2
+++

## File Summary

- **File Path:** COBWEB\cobweb.cob
- **LOC:** 327
- **Last Modified:** 9 years 5 months
- **Number of Commits (Total / Last 6 Months / Last Month):** 5 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Top Contributors:** Addinall (5)


## Overview

This COBOL code demonstrates the creation of a simple responsive web application using HTML5, CSS3, and compiled COBOL, featuring a basic configuration file parser and the ability to output HTML content. The purpose of this code is to show that even legacy languages like COBOL can be utilized for modern application development.

## Function Explanation

1. **FETCH-CONFIGURATION:** This function reads the configuration file `conf/config.dat` and populates the `runtime-config-data` structure in the working storage section. The configuration file is expected to have key-value pairs separated by a colon.

2. **OUTPUT-HEADER:** This function outputs the header section of the HTML, including the content-type, HTML, head, and meta charset tags.

3. **OUTPUT-CSS3:** This function outputs the CSS3 styles for the HTML document. The styles are included in the `style-css`, `slider-css`, and `forms-css` copybooks.

4. **START-BODY:** This function outputs the opening body tag for the HTML document.

5. **SHOW-LOGO:** This function displays the main heading, subheading, and a paragraph of text in the HTML document.

6. **FETCH-CONTENT:** This empty function is a placeholder for future code improvements or additions for fetching content from a database or other data sources.

7. **END-HTML:** This function outputs the closing body and HTML tags.


{{< details "Cobol Code" >}}
```cob

          *> FILE web2.cob
                >>SOURCE FORMAT IS FREE
          *>
          *> vim: set expandtab tabstop=3 shiftwidth=3 autoindent smartindent:
          *> CAPTAIN SLOG - STARDATE 91509.82
          *> cobc (OpenCOBOL) 1.1.0
          *> Compiler Copyright (C) 2001-2009 Keisuke Nishida / Roger While
          *> Built    Nov 26 2013 06:25:08
          *> Packaged Feb 06 2009 10:30:55 CET
          *>
          *> $ cobd -x cobweb.cob
          *> $ mv cobweb cobweb.cobx
          *>
          *> Apache has .cobx defined as a CGI script on my system.
          *> you need to do the same.
          *>
          *> Writing HTML5/CSS3 RESPONSIVE Web pages 
          *> using OpenCOBOL.  A little fun XMAS task 
          *> I set for myself as I am getting tired of
          *> spotty num-nums telling me that to write
          *> Web 2.0 pages you NEED Ruby on Rails, Haskell,
          *> F#, Scala and or some unhealthy mixture of
          *> the lot of the rubbish.  Don't get me wrong,
          *> I am no great lover of COBOL.  Of course I can use it. 
          *> This just shows that a well structured bit of
          *> code can perform ANY task if asked nicely.
          *>
          *> My preference is to use HTML5, CSS3 and PHP and
          *> Modern Perl for the structured code portion of
          *> an application that uses Web 2.0 technology, but
          *> OLD COBOL does just as well! RoR, Elang, F#,
          *> Scala ALL look like BIG FAT UGLY COMPLEX systems
          *> that use the most complicated method of doing something
          *> simple.  I don't know whether anyone will use this
          *> code, but it may be of interest to a data shop
          *> already running a squillion lines of COBOL and a big
          *> chunk-O-COBOL WARRIORS!  The other consideration is
          *> that your web application is compiled code.  No script
          *> kiddies getting into your PHP and filling it full
          *> of Malware and Porn...
          *>
          *> Hmmm, on that note, I decided to take the CSS3 out of the
          *> CSS file/directory and embed the CSS in here.  That REALLY
          *> will stop hackers from a lot of the backdoor 'background'
          *> and iframe attacks.
          *>
          *> I also decided to write a JSON parser for COBOL today.
          *> I spent an hour with GOOBLE and nada.
          *>
          *> I decided to implement the JSON parser as a copybook in a
          *> seperate master tree.  It is really two different projects.
          *> For now I'll implent a quick and dirty config reader.
          *>
          *> A word from W3C
          *>
          *> Congratulations!
          *>
          *> The uploaded document "web2.html" was successfully checked as
          *> HTML5. This means that the resource in question identified
          *> itself as "HTML5" and that we successfully performed a formal
          *> validation of it. The parser implementations we used for this
          *> check are based on validator.nu (HTML5).
          *>
          *> Not bad for a language that was born in the same year
          *> as I. 1959.  There are still 40 BILLION lines of
          *> operational COBOL code running in the world TODAY!
          *> 
          *> Mark Addinall
          *> web2.cob and associated files are Copyright (C) Mark Addinall,
          *> 2013, 2014
          *> XMAS 2013
          *> Brisbane, Australia
          *> HAVE FUN!
          *>
            IDENTIFICATION DIVISION.
                PROGRAM-ID. cobweb.

            ENVIRONMENT DIVISION.
                CONFIGURATION SECTION.
                    SOURCE-COMPUTER. Fermi-Fedora-19.
                    OBJECT-COMPUTER. Fermi-Fedora-19.
                    REPOSITORY. 
                        FUNCTION ALL INTRINSIC. 

                INPUT-OUTPUT SECTION.
                    FILE-CONTROL.
                        SELECT config-file ASSIGN to "conf/config.dat"
                            ORGANIZATION IS LINE SEQUENTIAL.


            DATA DIVISION.

            FILE SECTION.

          *> This first data structure is going to be used to suck
          *> in the rather simplistic configuration file.  I am just
          *> going to modify the configuration I use in my Perl
          *> and PHP system just a little time bit. 
          *> Getting the configuration data for the Web application
          *> we will just read a flat text file until EOF and 
          *> fill the working data object from a VERY simplistic
          *> parse.
          *>
          *> The config file looks like this:
          *>
          *>   * This is a comment.  The asterix MUST be in COL1
          *>   * or we throw an exception and die. The nect line
          *>   * is empty, and we do not care...
          *>
          *>   token: value
          *>
          *>   * we don't care about case
          *>
          *>   NEXT-TOKEN: NEXT-VALUE
          *>
          *>   * nice and simple.

                FD config-file.

                01 config-data.
                    88 end-config               VALUE HIGH-VALUES.
                    05 stream       PIC X(512)  VALUE "UNDEFINED".


            WORKING-STORAGE SECTION.

          *> This variable deserves to be a CONSTANT as it never ever
          *> changes and is only used to pretty print HTML.
          *> HTTPD servers spit the
          *> dummy in a BIG 500 Server ERROR way if you don't feed them a
          *> line break after
          *> "Content-type: text/html"
          *> So we use it there as well.

                01 newline         PIC X   VALUE x'0a'.

          *> This first data structure is going to be used to suck
          *> in the rather simplistic configuration file.  I am just
          *> going to modify the configuration I use in my Perl
          *> and PHP system just a little time bit.  Notably in
          *> the support of database systems.  PHP and Perl have
          *> MUCH greater support for all types of database evils.
          *>
          *> In my PHP and Perl systems, config has evolved into a JSON
          *> description.  Now I will have to take it back a FEW years
          *> and flatten it out.
          *>

                01 runtime-config-data.
                    03 title        PIC X(64)   VALUE "Our Name Goes Here".
                    03 op-system    PIC X(64)   VALUE "UNDEFINED".
                    03 theme-name   PIC X(64)   VALUE "css/default.css".
                    03 url          PIC X(128)  VALUE "localhost".
                    03 ip           PIC X(64)   VALUE "127.0.0.1".
                    03 admin.
                        05 name     PIC X(128)  VALUE "UNDEFINED".
                        05 login    PIC X(32)   VALUE "admin".
                        05 password PIC X(32)   VALUE "UNDEFINED".


          *> Now we start to build up our Content Objects.  From the
          *> ground up.  I am not a big fan on 4+ Normal form.  But I
          *> do enjoys objects of objects.  So down at our content
          *> atomic level, and entry has a name (unique), the entry
          *> itself ""Lorem ipsum dolor sit amet, consectetur adipisicing 
          *> elit, sed do eiusmod tempor incididunt ut labore et dolore 
          *> magna aliqua.", and the TYPE.  TYPE is REALLY important as
          *> that is how our runtime engine decides what type of CSS3
          *> formatting to the beast.  The types are:
          *>
          *> WEB                The whole thing
          *> PAGE               Each actual or virtual page in the WEB
          *> SLIDER             Does the page have a slider?  NO Javascript.
          *> SLIDER-IMAGE       List of slider piccies
          *>                    For a static piccie on a page we use a
          *>                    SLIDER with only one entry.  There is no
          *>                    overhead as our slider is built with CSS3
          *>                    only.
          *> IMAGE              General page image
          *> AUDIO              HTML5 <audio> object
          *> VIDEO              HTML5 <video> object
          *>                    Not going to bother with FLASH as that
          *>                    technology is nearly dead and buried.
          *> HEADING-ONE        <h1>
          *> HEADING-TWO        <h2>
          *> HEADING-THREE      <h3>
          *> MENU               This is just a list.  I am not going to
          *>                    normalize it down into MENU-ENTRY as that
          *>                    is a pointless waste of time.
          *> ORDERED-LIST       <ol>
          *> UNORDERED-LIST     <ul>
          *> ARTICLE            an <article>
          *> BLOG-ENTRY
          *> BLOG-REPLY         "You're quite mad"
          *> QUOTATION
          *> FOOTER-BIG-TEXT    The world seems to like 12cm grey footers.
          *> FOOTER-SMALL-TEXT  (c) Me so piss orf!
          *>
          *> AJAX-WIDGET        This is a Web 2.0 SOAPy Framework, so we
          *>                    need to implement AJaX both on the CLIENT
          *>                    side and SERVER side COBOL.
          *> COMMENT            Last but not least, I seem to be the only
          *>                    author that will allow the CMS user to
          *>                    stick some in-silico documentation
          *>                    inside for a VIEW SOURCE.  Aren't I nice!
          *>
          *>                    That will do.
                01 content-entry.
                    03 entry-title  PIC X(32)   VALUE "UNDEFINED".
                    03 entry-type   PIC X(16)   VALUE "UNDEFINED".
                    03 entry-value  PIC X(1024) VALUE "IPSUM".
                    03 parent       PIC X(32)   VALUE "UNDEFINED".

          *> We will use the tried and trusted COBOL COPYBOOK method
          *> to include our CSS style, CSS utilities and any native
          *> Javascript we may want to use.  NATIVE Javascript only.


                COPY style-css.

                COPY slider-css.

                COPY forms-css.

                COPY validate-js.


            PROCEDURE DIVISION.

            HTML-PARAGRAPH.

          *> This program is really a template for getting RESPONSIVE
          *> Web applications up and running quickly, with a great deal
          *> of correctness security offered by a strict, but thorough
          *> template design.  So you probably won't want to hack this
          *> around much.  Formatting is all in the CSS3, where it
          *> should be.

                PERFORM FETCH-CONFIGURATION
                PERFORM OUTPUT-HEADER
                PERFORM START-BODY
                PERFORM FETCH-CONTENT
                PERFORM SHOW-LOGO
                PERFORM END-HTML
                STOP RUN.

            OUTPUT-HEADER.
                DISPLAY 
                    "Content-type: text/html"
                    newline
                    newline
                    "<!DOCTYPE html>"
                    newline
                    "<html>"
                    newline
                    "    <head>"
                    newline
                    '        <meta charset="UTF-8">'
                    newline
                    "        <title>"
                    newline
                    "HTML5/CSS3 RESPONSIVE code - IN COBOL"
                    newline
                    "        </title>"
                    newline
                END-DISPLAY.

                PERFORM OUTPUT-CSS3.

                DISPLAY
                    "    </head>"
                    newline
                END-DISPLAY.

            OUTPUT-CSS3.
                DISPLAY "<style type=""text/css"">".
                DISPLAY
                    HTML-GLOBAL-RESET
                    VIEWPORT-RESET
                    IMAGE-RESET
                    HTML-BODY-BASE
                    HTML-BODY-BASE
                    HTML-BODY-BASE
                    HTML-BODY-BASE
                    HTML-BODY-BASE
                    HTML-BODY-BASE
                    HTML-BODY-BASE
                END-DISPLAY

            START-BODY.
                DISPLAY "    <body>".

            SHOW-LOGO.
                DISPLAY 
                    "<h1>HTML5/CSS3 in COBOL</h1>"
                    newline
                    "<h2>I Heard COBOL is a Dead Language!</h2>"
                    newline
                    "<p>Phoenician is a dead language. Mayan is a dead "
                    "language. Latin is a dead language. What makes these "
                    "languages dead is the fact that no one speaks them "
                    "anymore. COBOL is NOT a dead language, and despite " 
                    "pontifications that come down to us from the ivory "
                    "towers of academia, it isn’t even on life "
                    "support.</p>"
                    END-DISPLAY.

            FETCH-CONFIGURATION.
                OPEN INPUT config-file
                READ config-file
                    AT END SET end-config TO TRUE
                END-READ

          *> Wow, I haven't written a lookahead file reader for
          *> a few decades!!  FUN!


                CLOSE config-file.

            FETCH-CONTENT.

            END-HTML.    
                DISPLAY "    </body>"
                DISPLAY "</html>".





```
{{< /details >}}

## Code Analysis

- There is code duplication in the `OUTPUT-CSS3` function. The `HTML-BODY-BASE` is repeated multiple times, which can be refactored.
- The SOLID principles are not strictly adhered to in this code.

## Data Operations

- Data read operation: The code reads a configuration file, `conf/config.dat`. The file contains key-value pairs separated by a colon.

## Risks

### Security issues:

- The code reads configuration information from a plain text file. Sensitive information like passwords should not be stored in plain text.

### Bugs:

- None found in the code.

## Refactoring Opportunities

1. Replace the repeated `HTML-BODY-BASE` in the `OUTPUT-CSS3` function with a loop to remove code duplication.
2. Consider using a more structured and secure way to store and read the configuration information, for example, an encrypted file or a secure solution like AWS Secrets Manager.

## User Acceptance Criteria

Feature: Output and display a responsive HTML5/CSS3 page using COBOL

```gherkin
Scenario: Render the HTML5/CSS3 page
  Given that the user runs the COBOL code
  When the code is executed
  Then the HTML5/CSS3 page should be output to the console
  And the page should include the following content:
  | Element         | Content                          |
  | Heading One     | HTML5/CSS3 in COBOL              |
  | Heading Two     | I Heard COBOL is a Dead Language |
  | Paragraph (text)| <As specified in the code>       |

Scenario: Read the configuration file
  Given that the user has provided a "conf/config.dat" file
  When the COBOL code is executed
  Then the code should read the configuration data
  And populate the runtime-config-data structure
```