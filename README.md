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


## How to contribute to the project?
If you are an existing or new association (LUG, Hackerspace, FABlab, ISP association, etc.) or a simple motivated person, you can take part in the project in several ways, some ideas: 

 * create / distribute communication materials about the Internet Brick and YunoHost
 * organise special "Internet Brick" or self-hosting install parties (possibly by inviting people from the project) and doing the support afterwards
 * provide openvpn VPNs in [cube format](https://labriqueinter.net/dotcubefiles.html), respecting net neutrality and with dedicated public ip (only FFDN ISPs or equivalent providers abroad)
 * take part in the development of the Internet Brick (maintenance of the existing one, backup, encryption, hard disk, application to broadcast the VPN via an ethernet port, support of VPN wireguard...) or in that of YunoHost
 * enrich [the Internet Brick wiki](https://wiki.labriqueinter.net) and [the YunoHost wiki](https://yunohost.org/fr)
 * host the annual Brick Camp
 * report bugs
 * coordinate recovery operations for unused Lime2 or Orange Pi PC plus cards
 * discuss with Olimex and/or Orange Pi resellers to offer an "Internet Brick" package


Translated with www.DeepL.com/Translator (free version)
