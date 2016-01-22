## Update the default string list

Updating the pot file from template files:
```
xgettext -Lphp --from-code UTF-8 index.html js/hypercube.js -o i18n/localization.pot
```

## Add a new language

Create a new directory path (e.g. for French):
```
mkdir -p sources/i18n/fr/
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

Save the modifications in poedit.

Then, convert the po to JSON:

```
./po2json i18n/fr/localization.po > i18n/fr/localization.json
```

NB: po2json is provided by http://search.cpan.org/~getty/Locale-Simple-0.016/bin/po2json
