## Update the default string list

Updating the pot file from template files:
```
xgettext --from-code UTF-8 -Llua -o i18n/localization.pot <(sed 's/title="\([^"]\+\)"/\1/g' index.html js/hypercube.js)
```

## Add a new language

Create a new directory path (e.g. for French):
```
mkdir -p i18n/fr/
```

Generate the po file:
```
msginit --locale=fr_FR.UTF-8 --no-translator -i i18n/localization.pot -o i18n/fr/localization.po
```

## Complete or fix a translation

Use poedit for editing the po:
```
poedit i18n/fr/localization.po
```

Select Catalog > Update from POT file, then update the strings and Save.

Finally, convert the po to JSON:

```
./po2json i18n/fr/localization.po > i18n/fr/localization.json
```

NB: po2json is provided by http://search.cpan.org/~getty/Locale-Simple-0.016/bin/po2json
