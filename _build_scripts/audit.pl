#!/usr/bin/perl
use strict;
use warnings;
use utf8;
binmode(STDOUT, ":utf8");

my $file = 'C:/Users/chris/Desktop/Hebrew BOM/BOM.html';
open my $fh, '<:encoding(UTF-8)', $file or die "Cannot open $file: $!\n";
my $content = do { local $/; <$fh> };
close $fh;

# 1. Extract all navTo targets
my %nav_seen;
my @nav_unique;
while ($content =~ /navTo\('([^']+)'\)/g) {
    my $t = $1;
    unless ($nav_seen{$t}) {
        $nav_seen{$t} = 1;
        push @nav_unique, $t;
    }
}

# 2. Extract all chapter-panel IDs
my %panel_set;
while ($content =~ /class="chapter-panel"[^>]*id="panel-([^"]+)"/g) {
    $panel_set{$1} = 1;
}

# 3. Extract all verse container IDs
my %container_set;
while ($content =~ /id="([^"]*-verses)"/g) {
    $container_set{$1} = 1;
}

# 4. Extract all renderVerseSet calls
my %rendered_containers;  # container_id -> var_name
while ($content =~ /renderVerseSet\((\w+),\s*'([^']+)'\)/g) {
    $rendered_containers{$2} = $1;
}

# 5. Extract all const ...Verses declarations and count verses
my %verse_data_info;  # var_name -> verse_count
while ($content =~ /const\s+(\w+Verses)\s*=\s*\[/g) {
    my $var_name = $1;
    my $start_pos = pos($content);
    my $bracket_depth = 1;
    my $pos = $start_pos;
    my $len = length($content);
    while ($bracket_depth > 0 && $pos < $len) {
        my $ch = substr($content, $pos, 1);
        if ($ch eq '[') { $bracket_depth++; }
        elsif ($ch eq ']') { $bracket_depth--; }
        $pos++;
    }
    my $array_content = substr($content, $start_pos, $pos - $start_pos - 1);
    my $verse_count = 0;
    while ($array_content =~ /\{\s*num:/g) {
        $verse_count++;
    }
    $verse_data_info{$var_name} = $verse_count;
}

# Define expected books and chapters
my @books = (
    ['1 Nephi (1n)',            'ch',    22, 'ch'],
    ['2 Nephi (2n)',            '2n-ch', 33, '2n-ch'],
    ['Jacob (jc)',              'jc-ch',  7, 'jc-ch'],
    ['Enos (en)',               'en-ch',  1, 'en-ch'],
    ['Jarom (jr)',              'jr-ch',  1, 'jr-ch'],
    ['Omni (om)',               'om-ch',  1, 'om-ch'],
    ['Words of Mormon (wm)',    'wm-ch',  1, 'wm-ch'],
    ['Mosiah (mo)',             'mo-ch', 29, 'mo-ch'],
    ['Alma (al)',               'al-ch', 63, 'al-ch'],
    ['Helaman (he)',            'he-ch', 16, 'he-ch'],
    ['3 Nephi (3n)',            '3n-ch', 30, '3n-ch'],
    ['4 Nephi (4n)',            '4n-ch',  1, '4n-ch'],
    ['Mormon (mm)',             'mm-ch',  9, 'mm-ch'],
    ['Ether (et)',              'et-ch', 15, 'et-ch'],
    ['Moroni (mr)',             'mr-ch', 10, 'mr-ch'],
);

sub compress_ranges {
    my @nums = @_;
    return '' unless @nums;
    my @ranges;
    my $start = $nums[0];
    my $end = $nums[0];
    for my $i (1..$#nums) {
        if ($nums[$i] == $end + 1) {
            $end = $nums[$i];
        } else {
            push @ranges, ($start == $end ? "$start" : "$start-$end");
            $start = $end = $nums[$i];
        }
    }
    push @ranges, ($start == $end ? "$start" : "$start-$end");
    return join(', ', @ranges);
}

print "=" x 80, "\n";
print "HEBREW BOOK OF MORMON -- CONTENT AUDIT REPORT\n";
print "=" x 80, "\n\n";

my $total_with_content = 0;
my $total_empty = 0;
my $total_expected = 0;

for my $book (@books) {
    my ($book_name, $prefix, $num_chapters, $nav_prefix) = @$book;

    printf "--- %s (%d chapters expected) ---\n", $book_name, $num_chapters;

    my @chapters_with_content;
    my @chapters_empty;

    for my $ch_num (1..$num_chapters) {
        my $chapter_id = "${prefix}${ch_num}";
        my $container_id = "${chapter_id}-verses";
        my $panel_id = $chapter_id;

        my $has_panel = exists $panel_set{$panel_id};
        my $has_container = exists $container_set{$container_id};
        my $has_render = exists $rendered_containers{$container_id};

        my $status;
        if ($has_render) {
            my $var_name = $rendered_containers{$container_id};
            my $verse_count = $verse_data_info{$var_name} || 0;
            $status = "CONTENT ($verse_count verses, var=$var_name)";
            push @chapters_with_content, $ch_num;
            $total_with_content++;
        } else {
            if ($has_panel && $has_container) {
                $status = "EMPTY STUB (panel+container exist, no verse data)";
            } elsif ($has_panel) {
                $status = "EMPTY STUB (panel exists, no verse data)";
            } elsif ($has_container) {
                $status = "EMPTY STUB (container exists, no verse data)";
            } else {
                $status = "MISSING (no panel, no container, no data)";
            }
            push @chapters_empty, $ch_num;
            $total_empty++;
        }

        my $has_nav = exists $nav_seen{$chapter_id};
        my $nav_status = $has_nav ? "in nav" : "NOT in nav";

        $total_expected++;
        printf "  Ch %2d: %-62s [%s]\n", $ch_num, $status, $nav_status;
    }

    printf "  SUMMARY: %d/%d with content, %d empty\n",
        scalar(@chapters_with_content), $num_chapters, scalar(@chapters_empty);
    if (@chapters_empty) {
        printf "  EMPTY chapters: %s\n", compress_ranges(@chapters_empty);
    }
    print "\n";
}

print "=" x 80, "\n";
print "OVERALL SUMMARY\n";
print "=" x 80, "\n";
printf "Total expected chapters: %d\n", $total_expected;
printf "Chapters WITH content:   %d\n", $total_with_content;
printf "Chapters EMPTY/MISSING:  %d\n", $total_empty;
print "\n";

# NAV-TO-PANEL CROSS-REFERENCE
print "=" x 80, "\n";
print "NAV-TO-PANEL CROSS-REFERENCE\n";
print "=" x 80, "\n";

my @chapter_nav = grep { !/^front-/ && $_ ne 'intro' } @nav_unique;
my @orphan_nav;
for my $nav_id (@chapter_nav) {
    unless (exists $panel_set{$nav_id}) {
        push @orphan_nav, $nav_id;
    }
}

if (@orphan_nav) {
    printf "Nav entries pointing to NON-EXISTENT panels (%d):\n", scalar(@orphan_nav);
    for my $n (@orphan_nav) {
        printf "  navTo(\"%s\") -> panel-%s NOT FOUND\n", $n, $n;
    }
} else {
    print "All nav entries have matching panels. OK\n";
}

my @panel_chapters = grep { $_ ne 'intro' } keys %panel_set;
my @orphan_panels;
for my $p (@panel_chapters) {
    unless (exists $nav_seen{$p}) {
        push @orphan_panels, $p;
    }
}

if (@orphan_panels) {
    printf "\nPanels with NO nav entry (%d):\n", scalar(@orphan_panels);
    for my $p (sort @orphan_panels) {
        my $has_render = exists $rendered_containers{"$p-verses"};
        my $note = $has_render ? " (HAS verse data)" : " (no verse data)";
        printf "  panel-%s exists but has no navTo entry%s\n", $p, $note;
    }
} else {
    print "All panels have matching nav entries. OK\n";
}
print "\n";

# COLOPHON STATUS
print "=" x 80, "\n";
print "COLOPHON STATUS\n";
print "=" x 80, "\n";
print "  1 Nephi colophon: rendered via renderColophon() to 'colophon-flow' (word pairs)\n";
my $n2c = $verse_data_info{'n2_colophonVerses'} || 0;
printf "  2 Nephi colophon: %s (%d verses)\n", ($n2c > 0 ? "CONTENT" : "EMPTY"), $n2c;
my $jcc = $verse_data_info{'jc_colophonVerses'} || 0;
printf "  Jacob colophon:   %s (%d verses)\n", ($jcc > 0 ? "CONTENT" : "EMPTY"), $jcc;
print "\n";

# SPECIAL NOTES
print "=" x 80, "\n";
print "SPECIAL NOTES\n";
print "=" x 80, "\n";

if (exists $verse_data_info{'fn_ch1Verses'}) {
    printf "4 Nephi: Uses JS variable 'fn_ch1Verses' (%d verses), rendered to '4n-ch1-verses'\n",
        $verse_data_info{'fn_ch1Verses'};
}

# Check Mosiah 28 ordering
my $mo28_pos = index($content, 'const mo_ch28Verses');
my $mo29_pos = index($content, 'const mo_ch29Verses');
if ($mo28_pos > 0 && $mo29_pos > 0 && $mo28_pos > $mo29_pos) {
    printf "Mosiah 28: Data declared AFTER Mosiah 29 in source (out of order, but still rendered)\n";
}
print "\n";

# COMPLETION TABLE
print "=" x 80, "\n";
print "COMPLETION TABLE\n";
print "=" x 80, "\n";
printf "%-27s %8s %8s %8s %6s\n", "Book", "Expected", "Content", "Empty", "Pct";
print "-" x 59, "\n";

my $grand_expected = 0;
my $grand_content = 0;

for my $book (@books) {
    my ($book_name, $prefix, $num_chapters, $nav_prefix) = @$book;
    my $content_count = 0;
    for my $ch_num (1..$num_chapters) {
        my $container_id = "${prefix}${ch_num}-verses";
        $content_count++ if exists $rendered_containers{$container_id};
    }
    my $empty_count = $num_chapters - $content_count;
    my $pct = $num_chapters > 0 ? sprintf("%.0f%%", 100*$content_count/$num_chapters) : "N/A";
    printf "%-27s %8d %8d %8d %6s\n", $book_name, $num_chapters, $content_count, $empty_count, $pct;
    $grand_expected += $num_chapters;
    $grand_content += $content_count;
}

print "-" x 59, "\n";
my $grand_empty = $grand_expected - $grand_content;
printf "%-27s %8d %8d %8d %5.0f%%\n", "TOTAL", $grand_expected, $grand_content, $grand_empty,
    100*$grand_content/$grand_expected;
