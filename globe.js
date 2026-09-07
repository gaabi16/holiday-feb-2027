/* Globuri interactive. Proiecție ortografică scrisă de mână, fără librării.
   Rutele se definesc mai jos, în ROUTES — nu e nevoie de niciun build pentru
   o destinație nouă. Datele coastelor se regenerează cu `node make-globe.mjs`. */
(function () {
  "use strict";

  /* ---- rute: coordonatele aeroporturilor și duratele de pe segmente ---- */
  var OTP = { code: "OTP", lon: 26.085, lat: 44.571 };
  var DXB = { code: "DXB", lon: 55.364, lat: 25.253 };
  var SIN = { code: "SIN", lon: 103.994, lat: 1.359 };
  var KWI = { code: "KWI", lon: 47.979, lat: 29.227 };
  var MNL = { code: "MNL", lon: 121.02, lat: 14.509 };
  var CLJ = { code: "CLJ", lon: 23.686, lat: 46.785 };
  var AUH = { code: "AUH", lon: 54.651, lat: 24.433 };
  var ATH = { code: "ATH", lon: 23.945, lat: 37.936 };
  var BAH = { code: "BAH", lon: 50.634, lat: 26.271 };
  var KUL = { code: "KUL", lon: 101.710, lat: 2.746 };
  var FCO = { code: "FCO", lon: 12.239, lat: 41.800 };
  var VIE = { code: "VIE", lon: 16.570, lat: 48.110 };
  var BKK = { code: "BKK", lon: 100.750, lat: 13.690 };
  var PEK = { code: "PEK", lon: 116.603, lat: 40.080 };
  var BRU = { code: "BRU", lon: 4.484, lat: 50.901 };
  var CRL = { code: "CRL", lon: 4.454, lat: 50.459 };

  var ROUTES = {
    "mnl-a": {
      points: [OTP, DXB, SIN, MNL],
      spans: [
        { from: 0, to: 1, text: ["5h 05m"] },
        { from: 1, to: 3, text: ["13h", "escală SIN 1h 50m"] }
      ]
    },
    "mnl-b": {
      points: [OTP, DXB, KWI, MNL],
      spans: [
        { from: 0, to: 1, text: ["5h 05m"] },
        { from: 1, to: 3, text: ["14h 25m", "escală KWI 3h 15m"] }
      ]
    },
    "mnl-c": {
      points: [CLJ, AUH, DXB, SIN, MNL],
      ground: [1],
      spans: [
        { from: 0, to: 1, text: ["5h 10m"] },
        { from: 1, to: 2, text: ["bus", "de verificat"], ground: true },
        { from: 2, to: 4, text: ["13h", "escală SIN 1h 50m"] }
      ]
    },
    "mnl-d": {
      points: [OTP, FCO, BAH, MNL],
      spans: [
        { from: 0, to: 1, text: ["2h 20m"] },
        { from: 1, to: 3, text: ["19h 30m", "escală BAH 5h 30m"] }
      ]
    },
    "bkk": {
      /* ruta se închide: dus prin Viena și Singapore, întors prin Beijing și
         Bruxelles, apoi transfer pe uscat până la Charleroi */
      points: [OTP, VIE, SIN, BKK, PEK, BRU, CRL, OTP],
      ground: [5],
      spans: [
        { from: 0, to: 1, text: ["1h 40m"] },
        { from: 1, to: 3, text: ["16h 15m", "escală SIN 2h"] },
        { from: 3, to: 5, text: ["19h 25m", "escală PEK 4h 20m"] },
        { from: 5, to: 6, text: ["transfer", "de verificat"], ground: true }
      ]
    },
    "kul": {
      points: [OTP, ATH, BAH, SIN, KUL],
      spans: [
        { from: 0, to: 1, text: ["1h 35m"] },
        { from: 1, to: 4, text: ["18h 50m", "escale BAH și SIN"] }
      ]
    }
  };

  /* ---- coaste, codificate de make-globe.mjs ---- */
/*LAND-DATA-START*/
var LAND_AB="!#$%()*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}";
var LAND="{$1qAYK)-)-O$Q#!;*!$/(T#!P#4,.,8+/Rr#|JK#?*/,#!/*0,L%8)2)*-9Q9]J@-,/$+$-E)E)K%O%U#!?,(,P*6*0,.,0*0..!D(D%-b_#XH@%=(/)5)A$7*(,=%+db#XHF+/$?$A(2*8)1RT#eG:%:$0-3$;#;$A#7(-,0(@%B!?wEQG(+%+)+;#9%?!.,;#9%3*!,:,2$:!*.$,!4..6$0+(),-,+(-{0q{#cM$!40J+($($,$*$$!(!$!B+@,(!b#(8%.#D+_#%T#)t#)b#*Q$%V#)Z#*_#*(,u#$i#(3,[#((.,,**%.E(3,C*V##T#(D)H*H*4,+,?(A*O$I$K$1,?*3,):.#6)H$F$4+F$@(@*:*D$!,+,**@(0)D(=(B!@$B*:(=(4#2!B$B%@!B(@#D#B!B!D!B!8*=(@%=$:,0),+0)8*=+B#:)D$=(D#B#B%.,1,-*;$/,%*+44%@!@!=#8),+B!@$@(@$8%@$624+:%@$4+@!=#=)4,,,8+B$8%2+@$8(:*=$B(@$6(0**.%,),)*),),!,$,,*,.(*%.#,,,0*0,2*4*,,0*0*8!0*2(4$2*0*4$0%++7)+%3(3#1%1)-)#+!+.)1%5#/)/)/-%+,+.)4%4),+(+*+.)*+$5*+$+*+#-/+/)?%+)1+C)?%;%A%3+E#I$E#E!*+D%:)0)9)G$A)#+!+=)(+=+R##J)B)J)X#%V#%H)L+8+.+=*F*J*P*H*X#!X##N)0,B*Z#$L(L(P$R#(D*1*+,!*K!O%K!),$4.(B(H(=*=*6,B(@$2$F$B$@(=(:*B*6*6**,9(,,2,8$:*8*4,..2(=!.+=!!,.,:#*+=#@(=$:!.+:*8(:$:$:*:$4*0*4%8$4-.)=(,,8(@!,+4,:$=!:!:#:#,)2):(:!=!:!8(:$4*8$8$4*.00*8%,)6%8!2)2):**,6(:*6$=(4(4*4(6#6*2*6!6($,6*4$8(6$6#8#4%$-4)0)=#2)4)8!4(6,6%8#6%8!8!49!%#-7%3+$+=!%+-)--4)=#:(0,*,0*0*(*0.0$:$8$8$.,*,2,8(4(0,0$2(8#6$8$:!2(.2,),-6#6#8$8#6!2$4#4%6(:!6$8#2*.*2*=22#2)2)@/8#6!:(8$6*0*=!2(4%.)2):!2%=)=#:$4*0*6$6#:#6$6!6#6#6(:(8!:!8$6$(.$,0)(+*+,+6%:$@!6$@!8!@!:#2)%+0):%:)@%B#8%:!2*6%2)6)=#=#.+:%4+:#:!:#=!=!:%:%8%2)#+-)--))--?#/+?%-+/)3+++%)#-!+0+(),+L#,-I#C%K#5-%-++-)@+.+6+=)B)D)T#).-b#%(#2)_#(T#)nx%%;iEQ?@1B%+-7!-*)+3)9$3*7$?07.A=6%B1@+..*28,2#*-.1.YAs;4+)+A)+,5--.=.4%2,-qFU;E#!0(,!(2)6%$%)+5nk#|68).$4(0#$;+)#3)*11%!1$/4#2/4!.2#Dgx#Q7(+4,(+!-)+13-+,-3!3))1/73--%5!/*9$%*.4@80(4*400..2,*$.2.(+JZy#v427$2,)(34)0#0,.#%5)/3$))$-#%+--13+#*+$.4)09,$,2*$4!0+2!(-,16-2,!0-2)*51ru#_.+%-*1,10/2%*.!.+.)*)4/.--}z#R,*)#/1#-$#.,*,#*(.q{#q+Xy%%1%#,.(*!Wy%*($#-##)Sv#o+)#),!*0/+ru#z*(3)$%##*#4.)W#_;_*$;*+#-%))0%)(3#+)%#5+9-A/K+A+93)5+/*3*%.#6+4!2$4.$!,.2$2),%2!6*.$2.!0(,(,!0040*.#,,#.2$0*.*-*+*1Z)uj#d**12**+.+#+(5$-*#*5#-*1:-2-0+#%01,7,(,-(((92/.+43(3$-#1.3#5%-%5!-%1-71++3)-)5+-%1%1$)/+9!5+-+/+3,/($.-%515*-$/$7*/0%4%.-,7$*.%2-15%00$0,.#235/)+33,!0/2-,((?01!7.I#?)9+7$7-5)%-)+5!/#5(1#1#/-)!-%-+1$1!70/(!0.$((!,$2#0-8%0!.+2!*+,%4-4%,.++6.)*+!.-4#*%*$0(($.#0,2$1,26*,,4,.$(#4*0$(**!.!:*..*...$,!.26,5.(+.*..%$2..*,.(!*,#!(.$.(2-0/0!0#%0.4,(#*,00*.#6(!.3*0(0)0+4%*$0)0(,!($.-)-++)!$+)-+-$)4/4).)2/*!.)()6)2*(0(,$0*4#,!*#0(4$(#*(.(0!*,**-$/(#$+*-$/!+*ds#x(*)1!+00%(#+W_#r(+#?26(.),)#%,wr#l(+!/$)($,2%*%()+Zs#f(%%16%0*!,3,-3xa#p(3)#($*,08,$(4*2!,$*#))9+3)11.w]#s%,)0$(+9%1#/!,..$**-Xa#s%#/C%A$!,4(0)2!6,-cr#w%!%3,-*+,($,)4+*)+]q#c%%#+(+,!(0+,);iX#W%L#*,J+,1D%=/9+9.5#9$5(;,1$+%I,%.5!28=#4),#$++of#x$-1#4(*(,()!-/ip#W%)#+,-0%4($$)*),/.)#):qn#j$-#%%-)/%-!3*/*$*6%.$(.$!$-0!*,.*#00$(%!/)/*Xc#m#))1(%,8$(+-qd#e#*33.3!/!1!(0@!:)2Zo#T$))%0%,+*/.1*((0)*%,%,-,)$-k#cf#;*E:/4::06!6+2):%H1L/2-.-(/F/*-5#(16/090!!+2%)%:+#)1#%*5$7(30-0/4?.3)/)$33)-$9$547(%)?!,42*):-4K63!C8)-+#%,!,3.:*2!#*C!+05(+.B(.*F+$+S#[b#B371%7(E!5%%1650,J,!--(+/5+8?%)6;!//)+*.47+%*$,10$81)$;!A/%+**6%8+!)2,2$2.F(,624)=#=!82$%1xc#:#3-$#1,-)#+0)@(4*,$/0#$+IZW#r$9!36?4+034-23B36)4+452-4307:#.0#F%65210+69:!41032-+30+,!$1,-2#.1%;#ET#w]#J:5;#)1!551#7+C#*9++01$-*;++.1!3$#@-*-4#6$6022)4((4,(=(24.0,,6.22.4,!.-$+0)6)#+1!(-1+/525#-Aub#z%$/!/)5+8+-*3)+;0)2*./,)+-$1/%*,40*0,*-4*(.2!#44-$-$+.tKy$5%+4%B,F2-.1.9%7+),_Bq(5#%$**!,0$(!!30pa#u(++)/))/2(*(*$00!%/46#5-V^#a(?5.22002.8(31/-1-q_#j)0)0!!+--/)!.!.#.2cb#p)*;3*!)*/-)!2)$%00#!,/46#*)*i_#U*%5-.-46#*)Ge_#m,0)**$)#+*1%3/+%3(30#,$@-#/*%#-3.+0%+105%-*$,*()*#+-0%,!8,+$F*60!-hDg,%%3!/#!.$$4!.#(%/sIa,)%/(-*$*,!(!2#.%()1!JsG]-6%$(4!0)(!()0!#).!.+++-(+!+!#%+!%()#+1)(!(1(+#1$+%/*$,8%2#,*-,!,/$(*0!._Y#q,3-3*#6.,:*0!(+++)/4_p#y,%%%(!(%,$$$(!(!$$#,#(#$#*++))#,lp#l-)!%(#$$$*#*##%)zp#x-!#-!!$.!,aq#z-#!)!%(!$*$$!(++Tr#[.%#)($!$$(!$%PSKm.,+8$*%6/0-*!0%#)4!2+#%1%/!1$C#2.+*/!+*%0/!5()(?(+(,(7$1-+!%)+#-$0*(,,(.(4$($6#4!6),RJT/)#%0+*(0*!,5!--c_#m.-3-4#40644.)%//E*XJc09%#,.$2#!%+uIc0%1%$$.-,!$4+0mf#x3()//+*-%)//*!..00%,.2)0U4m41-$#!#7+-$%,,!$!$*4!6*/R/m4.)4!4!#%0$#)C#!(;((,/Z+t5)3$)%-3,-$A.(.:#:$2$.^(X701#?-!+)+*!=%0.#.*Kli#]5+3(--1?+I#A91*!4I%9-;!831E/--,(6/*+28*.08020N*:%8J2-D8.,2=%=,0:(.A!357!9+g(n7+3+()2(*2,(34{j#k82%2,(9A)57E2-99!%8.2:$*B*4:94)-mCn94#6!-++!;,)*,**-,rBw:-!?*5.*$@):+!%4ea#k:-#G,),3*%*9().!*:%0%6#,+.+8+,/GT@l;152*0%))6),*8+)12($-,1-3+#1((4%(;5/!2.7(7!M!#*0,+(408F204*.!%)-//qe#V?8$+963+!/,+.-*#.!*.%:uj#l;:GC*/A69!130/1%4$8#:(2$B/6$B6.+,.((1,7#5,90W%a=I/A$4:-8B42,6$8/-1(135*z)x?/390#,D**--Wo#k@7+-*%.6*0(0#.)5-R#c#]A978$:!%3558#8?2#0;*+=%#//),-5-?!G)-(/-5$1)/(D86(E(),:*/.(2D#(010;()*,,)*/-!8/.,8444!=!+Qu#xA/#/$1*8(4#$+,xJ{B+/+$)*$$,*,!(%+TLXC;-1!%*4,@!!%0ww#pC0%0$4)8###1%3(+(5#%$$,8mMkD(-.(0):)=)!-4$2+5)C*/,7-A-+.?#4.(4*62!8r*{D%1:1?1a#15%?$^#,8,Q#.J(!*O(02F$D1D0@)F.H!-^IZE9!%.,.6(4)!+#%1)mDq{#UFX#3Z#7#/2))4]#%N57-E##5+%5!3*?*%.7$;#-*(,;%.-/+fy%!?-?$6-03.)$+))I(^#15#E3A/++A2Y#3-,5-A()1;7$+:%#A7#+3,+G/+9C%)9A5+2+D/R#.B60!,F*H=J8J44D;#/5Y#93@Y#+W#E41Q#%C#!2C(?-c#$i#)g#Ku#U#F#./8%0.:#B9$537#;+ECA+1?;A9//A//!/.A1#++$++))!1-%%%+)/%-%!-##,#0-4;*/!;+-5%3+5##.(4-84(14-(##)##(%!)(*,((#$*0#(/$+(A)3+7)..%,40/.3);1//7#--0/4%!-4%:26+2!$/A%-/5--18-,70523!3/%(/0)%3%3/#173A5;A5A39#/-+*/+A-7%+9-!)2*,A*-#?535%1298?6/03,K#G31;/35;5+0*2303$+0-85,5!(45!#9-C)3!32!,5(5.-0%.-*#0/,/!1#-$)$/,)*5!)1#54;4#./0#6+.$2%.+*%.-0-.%/%.(2*6#4*2+0$:+.)=%@+41-91/$/(*@%63=(*/(14).#.%.+05!$+)/-(##)$+$#+1!;%!3--A1;;1/71!+-)5)-#)3(?$3+5!G/#+3*)5)+/+)56-B+8).-6)@%05B+L)@!=%8A/1$?=,,)*963()412K%E!A#K*9(9$+@-$3#7-;*747*/63@-#1*)+/$(-#%*1,5.%(+2+!+#+$)*)()$%#2*.*$*)!/%/(+($!)4(4!0#222022**$##+#%$3,10)2%0#./(),%!%+/#)+)+1-$%)#-$/#%-!/)#-%%/!+)!+-)/$/)-!1)%-!)7+E-51-#)$-+1%3#)!%))!#)-!)#1!)0$0%*%2),($#,$(!,#.+*!,-*/6)412+$18#2$0/:-,-()0!().)()414-2-!(.!,(,#$)+%3%-)%),-,1D##,9074E,-*/69%#!1=5(%*7%%$7,;,%.+0;*5.-B5./0/*).)()!+/),%,%(+,-.!8*8$6*.$,(.!,!,(0$,*,!!)#-!/%)%9-9/?5C599?75C5739;%-%)1+)+)#%1)+%/++-;$/0)$))/$)#-*/.7*%(-#7(3!E(-)1+1//7+9-99+#13+%#1.3(-!)(!#7#+(%#+-+3);/+)$+(##-%3#3)-1-%#+-)--1;91/1+9+-##%/$-%9(/#+!9+3#/+-!+*)$-,!#%($0+2*(!2/8-43@14+2%8)2)D!=#0+,-4/=%236#4#0(6*6$.*6(,00*.$2!0)*)0%0!(*,)8%2-0$(#*)4387816/8!*(**4(2%(*:(4+0-(%.%$!*7++$+)3$-0+2121!5!3%3%E//)5)5*+!1(/!;%1)7+%$)!7,545./2)$1,-.%,#2-0+,%$)(#.#()$/.+!%*!()(#(#4$,+4-*,(.2(.#0*.(6%8#.$.%./,$,!.,**.!**202*$*0!.,20*28.,6$42.*44%@,4$0008.4,28*22!0-8$8%,!8.:(0,8*H(F$.%8,8!,%2!:.2%!-4,$%--!-*%#5/-$-0!(-,%=),$4%@+.56%B+:-.(..)4*,4.0$B%*+,!*%8#*)@!8)6).#4*,*6$2%*-(,4)4!.(**#$*.(2$*,4.2#4(,).,,/#5(1/C#3.9$%+1%709!/81..4/.:6D$,2L#=0=*H!H1B+=(6#=.$.%0/,/$)*?6;,3.2(44-,B,!*5%3#/)7#3)!/.)8$%+9%?-/((,7*$(8,)(E(!,7#)/31!)-%)$%;/+)1*/$+6)%%;#+)3-+,$(1$-!;%2/-#/!-.%%*/.-+%.-.)!-5(*-/#,51!3,+4%2+.-.!*%$!(/,#,$2$*#(%$)*-(5*/,5*32($-,!,/$)+)*!,($3$3)$-#)*-6-.3:34!*))%6)2)6-$%%+/.3$+/2+#--#-3+#!*(0((+.).+(),/(-,1$3,521.)8-$3,-%/++#5/K*C)#/!/51?%#)//+3,//+%11%11?!7!/+++-$),).7(+)-(-#(4#0-$%*$2,,!,(0!,%*!,!2+,B2=#B!:%4$F#.0(N7:3.C,#2@(H))=6-T#4*46(4(.*6DB,4!((4!(%2.%,#0+.!8(*(*6$,(4*#-%)$).#%+)$31*-!+8%!+:(.*:+.)2*F,=,8%$)8!(.B*%4!4.06,434!(4$0)#1*#0@*@$8%:$:.7.I#I)E)/07*(8+6,060T#:2(#,A.G)71(/E3M51A218-599)+G-5;$/3;!)63:3D/0M;?%A.+:)T#60]#6L8LBV#LF4_#=R#.F#D4L!J(f#1?):/8*H/]#%t#;4+!19-E)T$41%F1$C@)4%$,/.2*V#/4*/2T#86#8).230.010_#+.-;#!/2)F((0P.n#64#7/=#2*L$D,:/=0900,b#+B)p#92.7.#*;$,,/4!*J6262(]#%(/732)*1%A:/-1KA:#,*:**.6./.,29$%.48?4J2%2.$./+7:#-2H,P!J/56#8J*V##P$30=0:!N.Z#(*(]#$4%R#.L!(.8,V#,H)A)T##(-8(b#!R#-4+%-9)Y#-3)=%D%6(.1.*F(h#%(-|##$2P#F!F/.//+=3F+88F+H*L+2*H#36B,Y(/6/Z#3x#(N#4+#3=)B(J$J%L$J5=*32.,f#)P$b#-tx%+Z#w:Z7.1.#*%3#%3%+)%!-*16%2-D%D*$(%2(:3**21!(68)4,10).3%#3)2#(*,%,;*+6/*!*8#!26(4#(6%27#3(;+5%-/5%7765#1:;.-/fR#WF1)?*3#A,6*2,8%0%*%2+)q{#]Gfy%19!%*vx%,,q{#]G$$6!B)#%7%?#!2n9TPaF!7@4=1)1818226$:B#D#@-$-3/2-#-K1A#9*)-55)+;1A#3+#/9%?379+3#;D#,7.1B(L+8+2-=):+F#:##3*729D74*.:-D10F,:202#216;2=:-6)D2*H)8#6(6)=/*+J!!5*;6%2/D08:0,45@;:;+1@-6/F)2),32%,)$;1)1+G);5G#Q#(C!7#31?+CA954(F@P4D$6-5/*9*3@-H(8:!12+;/S#/5+;31$#6J4E!9%$)7-9)7)/1##!/*-,!#**%#)/#-!3%+!/#3)D(*%A)1!!())*#%113#*%!)*(-(%!+)+-3#$*0-,%4#+(/1$2)!5*#$)(7137)1/-!-+#)91/-+/%1(1*3.1!-,9!1!+)/)#-$#,+*-4-4%,(2%.34+(7-%$-./(9#5$3#+#()!+(%%#+$+%1!105#1(/#5%537+--)+!1$-()+5%1#A#-(-*-(321(/,-:%,-6*2$4(0(0,*0!4(*2*:(4!0!*%!-/-%1(#%-%1)(%!!#(#!%%-$##+$#%-%%##%)*%$(*%$!((*!$#$!.!.!*$$$*!*#(!($.#$#*%*%,#*)###%$+%)#+#-$%!-###+!)%%$)$%*-,+.+*+!%,!$!*%.$,(0(**0!##0#,%,)*%0#22,$!,(40.0!$(4#4.,*,,,!*)%)#)-#*+!/--,3,!*4+*!4=,#,,,*12#2-!)6#:$.+4#0*!(=$=!3)*-4!4-$3.!,%2+01!-,!0-,)=%$(4!8%,%2%:3$+,!(/0G.%$133*)J#!740=)H1.-%/=*L-D!D3@92)6!,+*;(/+G-/AA1;13)#)1$K)C#1)+%?7?#75-%/9!C+3+9)9357#1$/%7%-1-9I531++71/+/9/3(-#5.1#/0#-@5%12+#-5?C-M%9$(/%3(-/)9%5,+)$72).,*/5)3/#7)-5!3/)1818%+5;//;5+++*90/+$5!+%5+%5+#;,92;.+2*0-0#H,8:4C*64*H=+.P1*)?/(*B*L.0)8#:,$0F2F.D)D*4#=0@(L*P*R##F%D7.#,K8I:32+4$*3@7J5N+.+2123,,,-8*240.2%.+-/.((#6*((0,2#,0(0,#*,$#.**.$,0,.+*(0%6((%6+.)*%0((%$%*-*-#%)+)%!#%./)###-#%0#%)$%,+$)$+!!%%$-(%*$$!*)(+()$#*)($)%%%(+$#(!*$,%$((+*+,%*-,-,$((%$$%*)$#)/$)$-(-!)(-(/!-(-,;:-*3*/#3)-#1(1(5.3$9.5,%*/$7*+,90-0%.*$#*(*!*).#,).5872-25,#($0-*/.%2/!/0+.#*-2+4$,3,)#/*#+$-$1,+21()$!(+$!(/*)*)0-*7*+*-!-.!,-,+!%-+#!)0101.-(!4#.-*1.#%%*1(/0$$,#,,!.12/*+0+0+4+6%./0-$#*/$)(7$%(#0783B!(-*16%4-.(4!6)4,6(J%B)4).$(D+.5**%4)4%!K81,I,/6(0?.%4;2!./,5*%6?4/65$E!;*O85(I,A#K.;,9%(1/#9%5)9%%..8:*)*?/1/A12-539+7))+C-)-;+1!5%7+5)G)#(:,6*:0=$.,B0((4,$200;))(/+/.))+.7+/!#0(*/,?%5./(#01,,04.*.4$2#4,4!2*%,-(2,/!9%))1*C%A*+,?0B,R#.4!#-P!30;,1.7,A,0.J!=.*.8,8$L.6#D0D)4+,(H##%F%8$P)L#4#@(D):%L%F-8#6,=*D#D,F*2+2(*.2#F5B2$3=(,*=#F+T#+B%8$@-A-J%]#$6(8/:.7,0,=!6$4%8/:$H-F(D!%06(F+!5044!.890;,$:=2@#8-B95-L%S#U[#QH-+T#*@-=.6+45.,186$8#:+07*1H-J-#+E#0+))I$I*9#K)c#%?#/.?*5#;40$F$B!@(K(Q##A!-,T#,E!G*422,]#08%*lV#WH5/C2*$@!4%/gIQH!)7$9!9%)$9.$,,$T##J/q#]NSH4164Z#.H9%/N*8,R#/B+$-L*81V#+6+65I-T#/F)D5D!)1G;;,E8?##/8/B-,%07)1?(W#4B3:/$+[#,O0;.**C.A.!)a#%5,22L!N()*,.=8%,+,C.O*2(925!3,-)I%o#*Q#*E$3,8,A!)8468,Z#*3/3pT#aH=%J(*)7-F+%5G+5$1*W#4!*P#92:,,uj#SHC!O$#$6,@$B+$)/aQ#xG939$/4!...8(P!L%C5;%5R_#ZGY#--,S#0**446270l#$B%X#!8):+?)U#1?1!++Un#{H9+E$K,**J%X#%,iQ#yH/+A$;(..B(6),)-hk#XI33q#!E%M2.0@(]#!p#-1uS#pI4+!/-1E#9(!.E!#2:!D*B!$$:_X#fI,+6(8!(-/-k##W#-C!%*P.T$%A(B86*_#+J/H!A66,8#,-@s@yF/#g#(),I*#.8(#0N45(V#4).T#.j#2j#$H,N$2+1)o#-c#+e#7C7E5(5L3BRR#xI:)N!6))+=)0%B!B#F(N$H#8+*+1%A)?(a#%M!G$Y#*+0#.7,O$9,,,N#/R]#UJ#13+5!K+E%A(H4P0D!B$+mQ#SJ-!K$%(N!2%##+[Y#WJK)A*4,B$B%)),h/[JQ#-I*2(/,P(,+B%+QY#kJ;%E!!(8*.#@%-jR#aJC)3*-,!,@#.!=+%)/jT#eJ,+E$E*S#$8*;(#,N#]#+2-+yV#eJn$+L@4$2!Z#/)+6i,TKh#1W#+-35%-3;!O06*C*M634_#*.)B!,*D$@+0v/dKN)C/a##a#(%(A$9,f#*B%8*X#)3t;fK?#5###;%9(0,S#!N(D!()0*6$D%+%/gT#qJO#^#(G,32?(Z#2P*N/T#5)59fNTK=+A)I1I#O$9.$*4*K!9*/.2,2*8$+(T#$@/H%F%4/i#wEoL]##P#J)!%U#-W#%5%R#!S#/G)G3M%1%c##B#1%4-5)E)-+A)(%H!!%[#/Y#*a#%C$K$#.J(-22$Z#-?2G(4,J(**A,+0]##4#F,S#$m##I,3,;*%*D(=!L(D,=#:)40@$J$d#$0#b#$P!R##T%l0wL{$3K+s#!h$#.%n#$f#)L*4+9-Z#*[$,d#%0+y#1-)g##T##;13/!;=/C#G)L-(59!@5Q##=++)A%A!@1!+M,-)B%@/*3G%3,;.*/;/]#!B#[#3[#3c#+9!7+A7Q#1/#A%A%51!1-/E3,3-3-7A#C6M!5.18G=-2%6A6,21,8=D*,,(49)/%5#;*#2,.8!N%G05*7#3*:6/,32;8?,!,[#0O$[##U#!;*G0Z#*N${#(S#,$,t#.r#.,,[#*6,l#2D$+.T#(f#(f#!:)Z#.V#)B#P)U#.$,l#0n#!@*n#$r%#";
/*LAND-DATA-END*/

  /* transportul de la sol (bus/taxi) e tot o linie plină, cu aceeași aură ca
     zborurile, dar turcoaz — se vede că nu e zbor fără să fie ștearsă */
  var GROUND = "#3ddbd9";
  var GROUND_GLOW = "rgba(61,219,217,.7)";

  var RAD = Math.PI / 180;

  function decodeLand() {
    if (!LAND) return [];
    var half = LAND_AB.length / 2;
    var idx = {}, i;
    for (i = 0; i < LAND_AB.length; i++) idx[LAND_AB.charAt(i)] = i;
    var p = 0;
    function varint() {
      var v = 0, mul = 1, c;
      for (;;) {
        c = idx[LAND.charAt(p++)];
        if (c >= half) { v += (c - half) * mul; mul *= half; }
        else return v + c * mul;
      }
    }
    function delta() { var z = varint(); return z & 1 ? -(z + 1) / 2 : z / 2; }

    var rings = [], n = varint(), r, len, lon, lat, j;
    for (r = 0; r < n; r++) {
      len = varint();
      var xyz = new Float32Array(len * 3);
      lon = 0; lat = 0;
      for (j = 0; j < len; j++) {
        lon += delta();
        lat += delta();
        toXYZ(lon / 10, lat / 10, xyz, j * 3);
      }
      rings.push(xyz);
    }
    return rings;
  }

  function toXYZ(lon, lat, out, o) {
    var a = lon * RAD, b = lat * RAD, cb = Math.cos(b);
    out[o] = cb * Math.cos(a);
    out[o + 1] = cb * Math.sin(a);
    out[o + 2] = Math.sin(b);
  }

  var LAND_RINGS = decodeLand();

  /* graticula: meridiane și paralele din 20 în 20 de grade */
  var GRATICULE = (function () {
    var lines = [], lon, lat, i, n, xyz;
    for (lon = -180; lon < 180; lon += 20) {
      n = 73; xyz = new Float32Array(n * 3);
      for (i = 0; i < n; i++) toXYZ(lon, -90 + i * 2.5, xyz, i * 3);
      lines.push(xyz);
    }
    for (lat = -80; lat <= 80; lat += 20) {
      n = 145; xyz = new Float32Array(n * 3);
      for (i = 0; i < n; i++) toXYZ(-180 + i * 2.5, lat, xyz, i * 3);
      lines.push(xyz);
    }
    return lines;
  })();

  /* eșantionează un arc de cerc mare între două puncte */
  function greatCircle(a, b) {
    var A = new Float32Array(3), B = new Float32Array(3);
    toXYZ(a.lon, a.lat, A, 0);
    toXYZ(b.lon, b.lat, B, 0);
    var dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    var omega = Math.acos(dot);
    var steps = Math.max(16, Math.round((omega / RAD) * 1.2));
    var xyz = new Float32Array((steps + 1) * 3), i, t, s1, s2, so = Math.sin(omega);
    for (i = 0; i <= steps; i++) {
      t = i / steps;
      if (so < 1e-6) { s1 = 1 - t; s2 = t; }
      else { s1 = Math.sin((1 - t) * omega) / so; s2 = Math.sin(t * omega) / so; }
      xyz[i * 3] = A[0] * s1 + B[0] * s2;
      xyz[i * 3 + 1] = A[1] * s1 + B[1] * s2;
      xyz[i * 3 + 2] = A[2] * s1 + B[2] * s2;
    }
    return xyz;
  }

  /* ---- un glob ---- */
  function Globe(el) {
    var route = ROUTES[el.getAttribute("data-route")];
    if (!route) return;

    var canvas = el.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var pts = route.points;

    var lons = pts.map(function (p) { return p.lon; });
    var lats = pts.map(function (p) { return p.lat; });
    var home = {
      lon: (Math.min.apply(null, lons) + Math.max.apply(null, lons)) / 2,
      lat: (Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2
    };
    var cLon = home.lon, cLat = home.lat, zoom = 1;

    var arcs = [], i;
    for (i = 0; i < pts.length - 1; i++) arcs.push(greatCircle(pts[i], pts[i + 1]));

    /* bucățile de drum de la sol (bus/taxi) se desenează separat de zboruri */
    var ground = {};
    (route.ground || []).forEach(function (idx) { ground[idx] = true; });

    var wpXYZ = new Float32Array(pts.length * 3);
    for (i = 0; i < pts.length; i++) toXYZ(pts[i].lon, pts[i].lat, wpXYZ, i * 3);

    /* eticheta cu durata stă la mijlocul celei mai lungi bucăți din span —
       nu la mijlocul întregului traseu, unde ar cădea peste escală */
    var spans = (route.spans || []).map(function (s) {
      var best = arcs[s.from], k;
      for (k = s.from + 1; k < s.to; k++) if (arcs[k].length > best.length) best = arcs[k];
      var n = best.length / 3;
      var at = function (j) {
        j = Math.max(0, Math.min(n - 1, j)) * 3;
        return [best[j], best[j + 1], best[j + 2]];
      };
      var m = Math.floor(n / 2);
      return { text: s.text, ground: s.ground, mid: at(m), prev: at(m - 3), next: at(m + 3) };
    });

    var size = 0, dpr = 1, R = 0, cx = 0, cy = 0;
    var sc = 0, cc = 0, sd = 0, cd = 0;
    var vx = 0, vy = 0, vz = 0;

    function setCenter() {
      var a = cLon * RAD, b = cLat * RAD;
      sc = Math.sin(a); cc = Math.cos(a); sd = Math.sin(b); cd = Math.cos(b);
    }

    /* rotește un punct 3D și îl duce în pixeli; lasă rezultatul în vx, vy, vz */
    function project(buf, o) {
      var X = buf[o], Y = buf[o + 1], Z = buf[o + 2];
      var ex = -X * sc + Y * cc;
      var ny = -X * cc * sd - Y * sc * sd + Z * cd;
      vz = X * cc * cd + Y * sc * cd + Z * sd;
      vx = cx + R * ex;
      vy = cy - R * ny;
    }

    /* punctul de pe orizont, între un punct vizibil și unul ascuns */
    function horizon(ax, ay, az, bx, by, bz) {
      var t = az / (az - bz);
      var x = ax + (bx - ax) * t - cx, y = ay + (by - ay) * t - cy;
      var l = Math.sqrt(x * x + y * y) || 1;
      return [cx + (x / l) * R, cy + (y / l) * R];
    }

    function polyline(buf, close) {
      var open = false, px = 0, py = 0, pz = 0, first = true, h;
      for (var o = 0; o < buf.length; o += 3) {
        project(buf, o);
        if (vz > 0) {
          if (!open) {
            if (!first && pz <= 0) { h = horizon(vx, vy, vz, px, py, pz); ctx.moveTo(h[0], h[1]); ctx.lineTo(vx, vy); }
            else ctx.moveTo(vx, vy);
            open = true;
          } else ctx.lineTo(vx, vy);
        } else if (open) {
          h = horizon(px, py, pz, vx, vy, vz);
          ctx.lineTo(h[0], h[1]);
          open = false;
        }
        px = vx; py = vy; pz = vz; first = false;
      }
      if (open && close) ctx.closePath();
    }

    /* pentru uscat: punctele ascunse se lipesc de marginea globului, ca
       poligonul să rămână închis și fără coarde peste ocean */
    function ringPath(buf) {
      var any = false, x, y, l;
      for (var o = 0; o < buf.length; o += 3) {
        project(buf, o);
        if (vz > 0) any = true;
        else {
          x = vx - cx; y = vy - cy;
          l = Math.sqrt(x * x + y * y);
          if (l < 1e-6) { x = 1; y = 0; l = 1; }
          vx = cx + (x / l) * R; vy = cy + (y / l) * R;
        }
        if (o === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      return any;
    }

    /* etichetele deja așezate în cadrul curent, ca să nu se calce una pe alta */
    var placed = [];
    function overlap(box) {
      var total = 0, k, q, w, hh;
      for (k = 0; k < placed.length; k++) {
        q = placed[k];
        w = Math.min(box[2], q[2]) - Math.max(box[0], q[0]);
        hh = Math.min(box[3], q[3]) - Math.max(box[1], q[1]);
        if (w > 0 && hh > 0) total += w * hh;
      }
      return total;
    }

    function pillBox(lines, x, y) {
      var fs = Math.max(10, Math.min(12, size * 0.031));
      ctx.font = "600 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      var w = 0, i;
      for (i = 0; i < lines.length; i++) w = Math.max(w, ctx.measureText(lines[i]).width);
      var lh = fs * 1.35;
      var bw = w + 14, bh = lh * lines.length + 8;
      var bx = Math.max(8, Math.min(size - bw - 8, x - bw / 2));
      var by = Math.max(8, Math.min(size - bh - 8, y - bh / 2));
      return [bx, by, bx + bw, by + bh, fs, lh];
    }

    function pill(lines, x, y, isGround) {
      var b = pillBox(lines, x, y);
      var bx = b[0], by = b[1], bw = b[2] - b[0], bh = b[3] - b[1], fs = b[4], lh = b[5];
      var i;
      ctx.fillStyle = "rgba(7,19,32,.86)";
      ctx.strokeStyle = isGround ? "rgba(61,219,217,.55)" : "rgba(255,176,32,.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isGround ? GROUND : "#ffb020";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + bw / 2, by + 4 + lh * (i + 0.5));
      }
    }

    function draw() {
      if (!size) return;
      setCenter();
      R = size * 0.47 * zoom;
      cx = size / 2; cy = size / 2;
      var clip = Math.min(R, size / 2);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, clip, 0, Math.PI * 2);
      ctx.clip();

      var g = ctx.createRadialGradient(cx - R * 0.26, cy - R * 0.38, R * 0.05, cx, cy, R * 1.75);
      g.addColorStop(0, "#123049");
      g.addColorStop(0.62, "#0b1e30");
      g.addColorStop(1, "#050e18");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(43,77,105,.45)";
      ctx.beginPath();
      for (var i = 0; i < GRATICULE.length; i++) polyline(GRATICULE[i], false);
      ctx.stroke();

      ctx.fillStyle = "#1b3a4f";
      ctx.strokeStyle = "#2f6684";
      ctx.lineWidth = 0.6;
      for (i = 0; i < LAND_RINGS.length; i++) {
        ctx.beginPath();
        if (ringPath(LAND_RINGS[i])) { ctx.fill(); ctx.stroke(); }
      }

      /* bucata de drum de la sol (bus/taxi) — linie plină, turcoaz, nu e zbor */
      var hasGround = false;
      for (i = 0; i < arcs.length; i++) if (ground[i]) hasGround = true;
      if (hasGround) {
        ctx.save();
        ctx.shadowColor = GROUND_GLOW;
        ctx.shadowBlur = 9;
        ctx.strokeStyle = GROUND;
        ctx.lineWidth = 2.1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (i = 0; i < arcs.length; i++) if (ground[i]) polyline(arcs[i], false);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.shadowColor = "rgba(255,176,32,.7)";
      ctx.shadowBlur = 9;
      ctx.strokeStyle = "#ffb020";
      ctx.lineWidth = 2.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (i = 0; i < arcs.length; i++) if (!ground[i]) polyline(arcs[i], false);
      ctx.stroke();
      ctx.restore();

      var vg = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R);
      vg.addColorStop(0, "rgba(79,163,209,0)");
      vg.addColorStop(1, "rgba(79,163,209,.5)");
      ctx.fillStyle = vg;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "rgba(61,123,163,.6)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy, clip - 0.5, 0, Math.PI * 2);
      ctx.stroke();

      /* Etichetele se așază una câte una, fiecare pe primul loc liber. Fără asta,
         aeroporturi apropiate — Abu Dhabi și Dubai sunt la 116 km — ajung cu
         etichetele una peste alta la scara globului. */
      placed.length = 0;
      var wpPos = [];
      for (i = 0; i < pts.length; i++) {
        project(wpXYZ, i * 3);
        wpPos.push(vz > 0 ? [vx, vy] : null);
      }

      /* codurile de aeroport: opt direcții în jurul punctului, prima liberă câștigă */
      var fs = Math.max(11, Math.min(13, size * 0.033));
      ctx.font = "600 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      var codeAt = [];
      for (i = 0; i < pts.length; i++) {
        if (!wpPos[i]) { codeAt.push(null); continue; }
        var x = wpPos[i][0], y = wpPos[i][1];
        /* o rută care se închide trece de două ori prin același aeroport — codul
           se scrie o singură dată */
        var dup = false;
        for (var q = 0; q < i; q++) {
          if (wpPos[q] && pts[q].code === pts[i].code &&
              Math.abs(wpPos[q][0] - x) < 2 && Math.abs(wpPos[q][1] - y) < 2) { dup = true; break; }
        }
        if (dup) { codeAt.push(null); continue; }
        var cw = ctx.measureText(pts[i].code).width;
        var ddx = x - cx, ddy = y - cy, dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        var base = Math.atan2(ddy / dl, ddx / dl);
        var spot = null, spotBox = null, spotCost = Infinity;
        for (var a = 0; a < 8; a++) {
          var ang = base + Math.ceil(a / 2) * (a % 2 ? -1 : 1) * (Math.PI / 4);
          var lx = x + Math.cos(ang) * 13, ly = y + Math.sin(ang) * 13;
          var right = Math.cos(ang) >= -0.01;
          var bx0 = right ? lx : lx - cw;
          var box = [bx0 - 2, ly - fs / 2 - 2, bx0 + cw + 2, ly + fs / 2 + 2];
          var cost = overlap(box);
          if (cost < spotCost) { spot = [lx, ly, right]; spotBox = box; spotCost = cost; }
          if (cost === 0) break;
        }
        placed.push(spotBox);
        codeAt.push(spot);
      }

      /* durata pe fiecare bucată de traseu, împinsă până scapă de ce e deja pus */
      var offs = [26, 42, 58, 74, 90, 106];
      for (i = 0; i < spans.length; i++) {
        var s = spans[i];
        if (!s.mid) continue;
        project(s.mid, 0);
        if (vz <= 0.06) continue;
        var mx = vx, my = vy;
        project(s.prev, 0); var ax = vx, ay = vy;
        project(s.next, 0); var bx = vx, by = vy;
        var tx = bx - ax, ty = by - ay, tl = Math.sqrt(tx * tx + ty * ty) || 1;
        var nx = -ty / tl, ny = tx / tl;
        var pick = null, pickBox = null, pickCost = Infinity;
        for (var oi = 0; oi < offs.length && pickCost > 0; oi++) {
          for (var sg = 0; sg < 2; sg++) {
            var sx = sg ? -nx : nx, sy = sg ? -ny : ny;
            var px2 = mx + sx * offs[oi], py2 = my + sy * offs[oi];
            var pb = pillBox(s.text, px2, py2);
            var pc = overlap(pb);
            if (pc < pickCost) { pick = [px2, py2]; pickBox = pb; pickCost = pc; }
            if (pc === 0) break;
          }
        }
        placed.push(pickBox);
        pill(s.text, pick[0], pick[1], s.ground);
      }

      /* aeroporturi, desenate deasupra etichetelor */
      for (i = 0; i < pts.length; i++) {
        if (!wpPos[i] || !codeAt[i]) continue;
        var px3 = wpPos[i][0], py3 = wpPos[i][1];
        ctx.fillStyle = "rgba(255,176,32,.28)";
        ctx.beginPath(); ctx.arc(px3, py3, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(px3, py3, 3.2, 0, Math.PI * 2); ctx.fill();

        ctx.font = "600 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
        ctx.textAlign = codeAt[i][2] ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(5,14,24,.85)";
        ctx.strokeText(pts[i].code, codeAt[i][0], codeAt[i][1]);
        ctx.fillStyle = "#e3edf5";
        ctx.fillText(pts[i].code, codeAt[i][0], codeAt[i][1]);
      }
    }

    var pending = false;
    function render() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; draw(); });
    }

    function resize() {
      var w = Math.round(el.clientWidth);
      if (!w || w === size) { if (w) render(); return; }
      size = w;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.height = size + "px";
      render();
    }

    /* ---- rotire, zoom ---- */
    var pointers = {}, last = null, pinch = 0;
    /* rotița apropie globul doar după ce s-a dat click pe el, altfel ar bloca
       derularea paginii pentru cine trece cu mouse-ul peste */
    var armed = false;

    function setZoom(z) {
      zoom = Math.max(1, Math.min(8, z));
      render();
    }

    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      last = { x: e.clientX, y: e.clientY };
      pinch = 0;
      armed = true;
      el.classList.add("dragging");
    });

    canvas.addEventListener("focus", function () { armed = true; });
    canvas.addEventListener("blur", function () { armed = false; });
    canvas.addEventListener("pointerleave", function () {
      if (!Object.keys(pointers).length && document.activeElement !== canvas) armed = false;
    });

    canvas.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length >= 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        if (pinch) setZoom(zoom * (d / pinch));
        pinch = d;
        last = null;
        return;
      }
      if (!last) { last = { x: e.clientX, y: e.clientY }; return; }
      var k = 1 / (R * RAD);
      cLon -= (e.clientX - last.x) * k;
      cLat += (e.clientY - last.y) * k;
      cLat = Math.max(-90, Math.min(90, cLat));
      if (cLon > 180) cLon -= 360;
      if (cLon < -180) cLon += 360;
      last = { x: e.clientX, y: e.clientY };
      render();
    });

    function endPointer(e) {
      delete pointers[e.pointerId];
      if (!Object.keys(pointers).length) { last = null; pinch = 0; el.classList.remove("dragging"); }
    }
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    canvas.addEventListener("wheel", function (e) {
      if (!armed) return; // lasă pagina să deruleze
      e.preventDefault();
      setZoom(zoom * Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.03 : 0.0016)));
    }, { passive: false });

    canvas.addEventListener("keydown", function (e) {
      var step = 8, done = true;
      if (e.key === "ArrowLeft") cLon -= step;
      else if (e.key === "ArrowRight") cLon += step;
      else if (e.key === "ArrowUp") cLat = Math.min(90, cLat + step);
      else if (e.key === "ArrowDown") cLat = Math.max(-90, cLat - step);
      else if (e.key === "+" || e.key === "=") setZoom(zoom * 1.35);
      else if (e.key === "-" || e.key === "_") setZoom(zoom / 1.35);
      else if (e.key === "0") { cLon = home.lon; cLat = home.lat; setZoom(1); }
      else done = false;
      if (done) { e.preventDefault(); render(); }
    });

    el.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "in") setZoom(zoom * 1.35);
      else if (act === "out") setZoom(zoom / 1.35);
      else { cLon = home.lon; cLat = home.lat; setZoom(1); }
    });

    if (window.ResizeObserver) new ResizeObserver(resize).observe(el);
    window.addEventListener("resize", resize);
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
  }

  var nodes = document.querySelectorAll(".globe[data-route]");
  for (var n = 0; n < nodes.length; n++) new Globe(nodes[n]);
})();
