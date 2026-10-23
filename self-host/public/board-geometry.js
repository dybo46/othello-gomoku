// Pixel centres shared by every frame layout, including the smaller velvet opening.
export function boardPoint(index,rect){return {x:rect.left+rect.width*((index%8)+.5)/8,y:rect.top+rect.height*((index>>3)+.5)/8};}
