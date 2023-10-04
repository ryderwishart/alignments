export function convertUrl(urlStr: string): string {
  try {
    const parsedUrl = new URL(urlStr);
    const path = parsedUrl.pathname;
    const filename = path.split('/').pop();
    const newPath = '/wikipedia/commons' + path.split('/').slice(-2).join('/');
    const newUrl = new URL('https://upload.wikimedia.org' + newPath);
    return newUrl.href;
  } catch (error) {
    console.error(`Invalid URL: ${urlStr}`);
    return urlStr;
  }
}

/*
I have URLs like this:
original URL: https://commons.wikimedia.org/wiki/File:Cuminum_cyminum_-_Köhler–s_Medizinal-Pflanzen-198.jpg

When visiting the original URL, there is a #file element on the page that has an updated URL like this:
updated URL: https://upload.wikimedia.org/wikipedia/commons/5/58/Cuminum_cyminum_-_Köhler–s_Medizinal-Pflanzen-198.jpg

I want to work through each row in a TSV file like this:
```
Id	FileName	Copyright	Title	Subject	Description	Tags	ThematicLink	URL
KNW-0436_broom_en	KNW-0436_broom_en.png	© Juan R. Lascorz, via Wikimedia Commons	Broom		Brooms	מַטְאֲטֵא; σαρόω	Realia:5.21.2	https://commons.wikimedia.org/wiki/File:37.Escopallos.JPG
etc.
```
And access the resource in the final column, visit the page, and extract the updated URL from the #file element.

Please write a simple python script I can run that will do this and report on progress while it works.
*/

// I have some plain text Bibles (.txt) in a folder. I also have a sibling folder called /alignments/ that maps between segments of the Bibles to show where a string offset range in the KJV text aligns with a string offset range in the Greek New Testament text, for example.
