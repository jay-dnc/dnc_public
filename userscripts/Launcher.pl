# Версия от 08-02-05
# + fix от 2010.04.15 by vGimly - для убивания роутинга прилетающим флотам..
# Launcher By Ustas
# Упрощенный алгоритм для зашвыривания флотов с большим радиусом.


my $size=1000;
my $hsize=$size/2;
my $qsize=$hsize/2;


$Empire->fake(0);
my $FleetPrefix = "";


sub min { my ($v1,$v2)=(shift,shift); return $v1<$v2 ? $v1 : $v2; }
sub max { my ($v1,$v2)=(shift,shift); return $v1>$v2 ? $v1 : $v2; }
sub intrand { my $val=shift; my $retval=$val; while($retval==$val){ $retval=int(rand($val)); } return $retval; } # целое 0-базированное
sub natrand { return intrand(shift)+1; } # натуральное (1..?)
sub sqHyp { my ($dx,$dy)=(shift,shift); return $dx*$dx+$dy*$dy; }


my $spd=1;
sub CalcStepN {
        my $sn=shift;
        $sn/=$spd;
        my $isn=int($sn);
        return $isn+($sn>$isn ? 1 : 0);
}


my %Jumpable=map {my $xy=[$_->getProp('x'),$_->getProp('y')]; ("$$xy[0]:$$xy[1]",$xy)}
        $Empire->planets->getAllJumpableQuick;
#$Jumpable{"$$_[0]:$$_[1]"}=$_ for map [$_->getProp('x'),$_->getProp('y')],$Empire->planets->getAllJumpableQuick;


for my $fl ($Empire->fleets->getFleetsByName("$FleetPrefix%")){
        my ($x,$y,$id,$tta,$jmp)=map $fl->getProp($_),qw(x y id turns_till_arrival fly_range);
        $spd=min($fl->getProp("fly_speed"),$jmp);
        next if $tta || !$jmp  || !$spd || $Empire->readVariable("PathFor$id");
        my $target=$Empire->readVariable("RouteFor$id") or next;




        my ($tx,$ty)=split /:/,$target;
        if($x==$tx && $y==$ty){
                $Empire->writeVariable("RouteFor$id",undef);
                next;
        }
        my ($dfrom,$dto)=($Empire->planets->get($x,$y)->getProp('jumpable'),$Empire->planets->get($tx,$ty)->getProp('jumpable'));
        my ($sqjmp,$sqspd)=($jmp*$jmp,$spd*$spd); # заранее считаем квадраты скорости и дальности - всё равно пригодятся
        # выносим основные координаты из левой четверти, чтобы не завязываться на отрицательные числа
        if($x<=$qsize){ $x+=$size; }
        if($y<=$qsize){ $y+=$size; }
        if($tx<=$qsize){ $tx+=$size; }
        if($ty<=$qsize){ $ty+=$size; }


        my $dx=abs($x-$tx);
        my $mmx=$dx>$hsize;
        if($mmx){ # проворачиваем глобус на 180° по горизонтали
                if($x>$tx){
                        $x-=$hsize;
                        $tx+=$hsize;
                }else{
                        $x+=$hsize;
                        $tx-=$hsize;
                }
                $dx=abs($x-$tx);
        }


        my $dy=abs($y-$ty);
        my $mmy=$dy>$hsize;
        if($mmy){ # проворачиваем глобус на 180° по вертикали
                if($y>$ty){
                        $y-=$hsize;
                        $ty+=$hsize;
                }else{
                        $y+=$hsize;
                        $ty-=$hsize;
                }
                $dy=abs($y-$ty);
        }
        my ($sqdx,$sqdy)=($dx*$dx,$dy*$dy);
        my ($sqdist,$mx,$my,$soloonly)=($sqdx+$sqdy,$x,$y,0);
        if($dfrom && $dto && $sqdist>$sqjmp){
                my ($solodx,$solody)=($sqdx,$sqdy);
                if($sqdx>$sqdy){
                        if($solody){ $solody--; }
                        $solodx=int($jmp/sqrt($solody/$sqdx+1));
                        $solody=min(int(sqrt($sqjmp-$solodx*$solodx)),$dy);
                }else{
                        if($solodx){ $solodx--; }
                        $solody=int($jmp/sqrt($solodx/$sqdy+1));
                        $solodx=min(int(sqrt($sqjmp-$solody*$solody)),$dx);
                }
                if(sqHyp($dx-$solodx,$dy-$solody)<=$sqjmp){ # цель достижима с промежуточного прыжка
                        ($mx,$my)=(($x>$tx) ? $x-$solodx : $x+$solodx,($y>$ty) ? $y-$solody : $y+$solody);
                        $soloonly=(exists $Jumpable{"$mx:$my"}) ? 2 : 1;
                }
        }
        if($soloonly!=2){
                if((!$dfrom && !$dto) || ($sqdist>$sqjmp)){
                        my ($ljmp)=($dfrom ? $jmp*2 : $jmp);
                        my ($bestctsn,$bestsn,$idealcsn,$idealctsn)=(0,0,1,1);
                        if($sqdist>$sqspd){ # ищем идеальную шаговость, может она сразу встретится?!
                                my ($idealdist,$idealdx,$idealdy)=($spd*int($jmp/$spd),0,0);
                                if($sqdx>$sqdy){
                                        $idealdx=int($idealdist/sqrt($sqdy/$sqdx+1)); # высчитывается наибольший возможный idealdx, потому что по нему можно будет получить чуть завышенный idealdy
                                        $idealdy=min(int(sqrt($idealdist*$idealdist-$idealdx*$idealdx)),$dy);
                                }else{
                                        $idealdy=int($idealdist/sqrt($sqdx/$sqdy+1));
                                        $idealdx=min(int(sqrt($idealdist*$idealdist-$idealdy*$idealdy)),$dx);
                                }
                                $idealcsn=CalcStepN(sqrt(sqHyp($idealdx,$idealdy)));
                                $idealctsn=CalcStepN(sqrt(sqHyp($dx-$idealdx,$dy-$idealdy)));
                        }
                        for my $cand (values %Jumpable){
                                my ($cx,$cy)=@$cand;
                                if($mmx){ $cx+=($cx>$hsize) ? -$hsize : $hsize; } # поворачиваем вслед за глобусом
                                if($mmy){ $cy+=($cy>$hsize) ? -$hsize : $hsize; } # поворачиваем вслед за глобусом
                                my $cdx=abs($x-$cx);
                                if($cdx>$ljmp){ # слишком далеко по оси x, попробуем с другой стороны
                                        $cx+=$size;
                                        $cdx=abs($x-$cx);
                                        next if $cdx>$ljmp; # слишком далеко по оси x
                                }
                                my $cdy=abs($y-$cy);
                                if($cdy>$ljmp){ # слишком далеко по оси y, попробуем с другой стороны
                                        $cy+=$size;
                                        $cdy=abs($y-$cy);
                                        next if $cdy>$ljmp; # слишком далеко по оси y
                                }
                                next if !$cdx && !$cdy; # это планета старта
                                my ($sqcd,$advance)=(sqHyp($cdx,$cdy),!$soloonly);
                                if($sqcd>$sqjmp){
                                        next if !$dfrom || !$advance; # прямой прыжок невозможен или уже есть вариант прямого прыжка
                                        $advance=0;
                                        my ($chdx,$chdy)=($sqjmp,$sqjmp); # в принципе, можно вообще не инициализировать, но если уж по правилам...
                                        if($cdx>$cdy){ # проверка на возможность прыжка через промежуточную планету, с учётом нечётности расстояния
                                                $chdx=int(($cdx+1)/2);
                                                $chdy=int((($chdx*2==$cdx) ? $cdy+1 : $cdy)/2);
                                        }else{
                                                $chdy=int(($cdy+1)/2);
                                                $chdx=int((($chdy*2==$cdy) ? $cdx+1 : $cdx)/2);
                                        }
                                        next if $sqjmp<sqHyp($chdx,$chdy);
                                }
                                my $sqctd=sqHyp($tx-$cx,$ty-$cy);
                                next if $sqctd>$sqdist; # пресекаем попытки улететь в другую сторону
                                my ($csn,$ctsn)=(CalcStepN(sqrt($sqcd)),CalcStepN(sqrt($sqctd)));
                                my $cbsn=$csn+$ctsn;
                                next if !$advance && $bestctsn && # не улучшение, причём уже есть другой вариант
                                        ($cbsn>$bestsn || # слишком долго, есть вариант с продвижением побыстрее
                                        ($cbsn==$bestsn && # возможно эту проверку стОит убрать
                                        $ctsn>$bestctsn)); # уже есть вариант прыжка, после которого мы окажемся ближе к цели
                                $mx=$cx;
                                $my=$cy;
                                last if $csn==$idealcsn && $ctsn<=$idealctsn;
                                $bestctsn=$ctsn;
                                $bestsn=$cbsn;
                        }
                        if(!$soloonly){
                                my ($mdx,$mdy)=(abs($x-$mx),abs($y-$my));
                                my ($sqmdx,$sqmdy)=($mdx*$mdx,$mdy*$mdy);
                                if($sqmdx+$sqmdy>$sqjmp){
                                        my ($interx,$intery)=($sqmdx,$sqmdy);
                                        if($sqmdx>$sqmdy){
                                                if($intery){ $intery--; }
                                                $interx=int($jmp/sqrt($intery/$sqmdx+1));
                                                $intery=min(int(sqrt($sqjmp-$interx*$interx)),$mdy);
                                        }else{
                                                if($interx){ $interx--; }
                                                $intery=int($jmp/sqrt($interx/$sqmdy+1));
                                                $interx=min(int(sqrt($sqjmp-$intery*$intery)),$mdx);
                                        }
                                        ($mx,$my)=(($x>$mx) ? $x-$interx : $x+$interx,($y>$my) ? $y-$intery : $y+$intery);
                                }
                        }
                }else{
                        $mx=$tx;
                        $my=$ty;
                }
        }
        if($mx!=$x || $my!=$y){
                if($mmx){ $mx+=($mx>$hsize) ? -$hsize : $hsize; }
                if($mmy){ $my+=($my>$hsize) ? -$hsize : $hsize; }
                if($mx>$size){ $mx-=$size; }
                if($my>$size){ $my-=$size; }
                if ($fl->jump($mx,$my))
                {
                        if ($mx==$tx && $my==$ty) {$Empire->writeVariable("RouteFor$id",undef)}
                        #else {push @auto,"$id/$mx:$my"}
                }
        }
}