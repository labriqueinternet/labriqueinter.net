# labriqueinter.net

Website (hosted on `brique.ldn-fai.net`):

* [french](http://labriqueinter.net/)
* [english](http://internetcu.be/)

## How to

### Update this website (on `brique.ldn-fai.net`):

```
% ssh brique.ldn-fai.net
% cd /var/www/labriqueinter.net
% sudo -u www-data git pull
```

### Update apps list:

```
wget https://raw.githubusercontent.com/YunoHost/apps/master/list_builder.py
python list_builder.py -o apps/labriqueinternet.json apps/labriqueinternet.list
```

## List of work documents:

* https://pad.ilico.org/p/internetcube-technical-meeting-20150706
* https://pad.gresille.org/p/test-debit-brique
* https://pad.ilico.org/p/hardware_brique
* http://pad.aquilenet.fr/p/LaBrique

**[BUG REPORTS SHOULD BE OPEN HERE](https://github.com/labriqueinternet/labriqueinter.net/issues)**
