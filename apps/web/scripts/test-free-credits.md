
Reset free credits transfer to sponsor and referred user by running the following SQL queries:
Replace `xxxxxxx` with the id of the referred user:
```
DELETE FROM payments p where p."resourceId" = 'xxxxxxx' AND p."fundsSource" = 'FREE_CREDITS';
DELETE FROM userlabels ul where ul."userId" = 'xxxxxxx' AND (ul.label = 'referral_10eur_credited' OR ul.label = 'referral_10eur_credited_to_sponsor')
```
