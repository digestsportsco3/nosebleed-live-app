#!/usr/bin/env python3
"""Cross-reference audit: every 'Section N.N' / 'Article N' / 'Schedule X' cited anywhere in the binder is checked
against the Operating Agreement's actual headings, unless the citation names another agreement.
Also lists every dollar, unit and percentage figure that is not in the allowed set."""
import re, glob, os, collections
oa = open('txt/01 - Operating Agreement.txt').read()
oa = re.sub(r'\n\s*NOSEBLEED SPORTS LLC – LIMITED LIABILITY COMPANY AGREEMENT – Page \d+ of \d+\n', '\n', oa)
flat = re.sub(r'\s+', ' ', oa)
secs = {}
for m in re.finditer(r'(?<![\d.])(\d{1,2}\.\d{1,2}) ("?[A-Z][^.]{2,80}?)[.\"]', flat):
    n = m.group(1)
    if n not in secs: secs[n] = m.group(2).strip('" ')
arts = set(re.findall(r'ARTICLE (\d+) –', flat))
scheds = set(re.findall(r'SCHEDULE ([A-F]) –', flat))
print('OA sections found:', len(secs), '| articles', sorted(arts, key=int), '| schedules', sorted(scheds))
missing = collections.defaultdict(set); cited = collections.Counter()
for f in sorted(glob.glob('txt/*.txt')):
    t = re.sub(r'\s+', ' ', open(f).read())
    for m in re.finditer(r'(Talent Agreement |JGN Agreement |Operating Agreement )?(Sections?|Section) ((?:\d{1,2}\.\d{1,2}(?:\([a-z]+\))?(?:, | and | or | through |, and )?)+)', t):
        ctx = t[max(0, m.start()-80):m.end()+60]
        owner = (m.group(1) or '').strip()
        # a reference followed by 'of the Talent Agreement' / 'of the JGN Agreement' belongs to that agreement
        after = t[m.end():m.end()+40]
        if 'of the Talent Agreement' in after or owner == 'Talent Agreement' or 'Talent Agreement Section' in ctx[60:120]: continue
        if 'of the JGN Agreement' in after or owner == 'JGN Agreement': continue
        if 'of the Act' in after or 'of the Code' in after: continue
        for n in re.findall(r'\d{1,2}\.\d{1,2}', m.group(3)):
            cited[n] += 1
            if n not in secs: missing[n].add(os.path.basename(f)[:2] + ': ...' + ctx[60:160])
print('\nCITATIONS TO OA SECTIONS THAT DO NOT EXIST:')
for n, ctxs in sorted(missing.items()):
    print(' ', n, '->', list(ctxs)[:2])
if not missing: print('  none')
print('\nCited OA sections and their headings:')
for n in sorted(cited, key=lambda x: tuple(map(int, x.split('.')))):
    if n in secs: print(f'  {n:>5} x{cited[n]:<3} {secs[n][:60]}')
# numbers
allowed_money = {'12,990','3,247.50','500','7,000','2,100','1,290','1,750','250','100','1,000','300','30','5,000','2,000','25,000','2,500','60,000','110,000','175,000','0'}
allowed_units = {'2,000,000','1,300,000','1,000,000','650,000','150,000','7,900,000','8,050,000','1,950,000','10,000,000','3,950,000','4,100,000','50,000','250,000','375,000','500,000','20,833','13,541'}
allowed_pct = {'20%','13%','1.5%','19.5%','24.845%','16.149%','1.863%','25.316%','16.456%','70%','50%','100%','25%','2%','5%','1.50%','0.50%','1.00%','1.25%','2.50%','3.75%','5.00%','2.5%'}
odd = collections.Counter()
for f in sorted(glob.glob('txt/*.txt')):
    t = open(f).read()
    for m in re.findall(r'\$([\d,]+(?:\.\d+)?)', t):
        if m not in allowed_money: odd[('$', m, os.path.basename(f)[:2])] += 1
    for m in re.findall(r'(?<![\d,.$])(\d{1,3}(?:,\d{3})+)(?![\d,%])', t):
        if m not in allowed_units and m not in allowed_money: odd[('units', m, os.path.basename(f)[:2])] += 1
    for m in re.findall(r'(\d+(?:\.\d+)?%)', t):
        if m not in allowed_pct: odd[('%', m, os.path.basename(f)[:2])] += 1
print('\nFIGURES OUTSIDE THE ALLOWED SET:')
for k, v in sorted(odd.items()): print(' ', k, v)
if not odd: print('  none')
