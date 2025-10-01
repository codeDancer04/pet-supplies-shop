type ImgProps = {
    imgUrl:string,
    imgAlt?:string
    href:string,
    imgWidth?:string,
    imgHeight?:string
}
const App = ({imgUrl,imgAlt,href,imgWidth,imgHeight}:ImgProps)=>{
    return(
        <>
        <a href={href}>
            <img src={imgUrl} alt={imgAlt} style={{width:imgWidth,height:imgHeight}}/>
        </a>
        </>
    )
};
export default App;